package com.example.demo.returnrequest.service;


import com.example.demo.auth.service.EmailService;
import com.example.demo.common.exception.ConflictException;
import com.example.demo.common.exception.NotFoundException;
import com.example.demo.common.exception.UnprocessableException;
import com.example.demo.order.entity.Order;
import com.example.demo.order.entity.OrderItem;
import com.example.demo.order.entity.OrderStatus;
import com.example.demo.order.repository.OrderRepository;
import com.example.demo.product.repository.ProductRepository;
import com.example.demo.returnrequest.dto.ReturnRequestResponse;
import com.example.demo.returnrequest.entity.ReturnRequest;
import com.example.demo.returnrequest.entity.ReturnRequestStatus;
import com.example.demo.returnrequest.repository.ReturnRequestRepository;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.weaver.ast.Or;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReturnService {

    // Window 3 ngày sau DELIVERED để cho phép return
    private static final int RETURN_WINDOW_DAYS = 3;

    private final ReturnRequestRepository returnRequestRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;
    // ─── User
    /**
     * User tạo return request.
     *
     * Điều kiện:
     * 1. Order phải DELIVERED
     * 2. Trong vòng 7 ngày kể từ deliveredAt
     * 3. Chưa có return request nào cho order này
     */
    @Transactional
    public ReturnRequestResponse requestReturn(String email, String orderCode, String reason){
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(()-> new NotFoundException("Order not found"));

        if(!order.getUser().getEmail().equals(email)){
            throw new NotFoundException("Order not found");
        }

        // Chỉ cho return khi DELIVERED
        if (order.getStatus() != OrderStatus.DELIVERED){
            throw new UnprocessableException(
                    "Can not request return. Order status: "+order.getStatus()
            );
        }
        // Kiểm tra trong window 3 ngày
        if(order.getDeliveredAt() == null || order.getDeliveredAt().plusDays(RETURN_WINDOW_DAYS).isBefore(LocalDateTime.now())){
            throw new UnprocessableException(
                    "Return window has expired. Returns must be required within"+RETURN_WINDOW_DAYS+ "days of delivery"
            );
        }
        // Kiểm tra chưa có return request
        if (returnRequestRepository.existsByOrderId(order.getId())){
            throw new ConflictException("A return request already exists for this order");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(()-> new NotFoundException("User not found"));

        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setOrder(order);
        returnRequest.setUser(user);
        returnRequest.setReason(reason);
        returnRequest.setStatus(ReturnRequestStatus.REQUESTED);

        // Update order status
        order.setStatus(OrderStatus.RETURN_REQUESTED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        ReturnRequest saved = returnRequestRepository.save(returnRequest);

        // Gửi email thông báo cho shop
        String shopEmail = order.getItems().get(0).getShop().getOwner().getEmail();
        emailService.sendReturnRequestToShop(shopEmail, orderCode, reason);

        log.info("Return request: OrderCode {} user {}", orderCode, email);
        return toResponse(saved);
    }

    @Transactional
    // User xem danh sách return request của mình
    public List<ReturnRequestResponse> getMyReturnRequests(String email){
        return returnRequestRepository.findByUserEmail(email)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ─── Shop
    // Shop xem tất cả return request của shop mình
    @Transactional
    public List<ReturnRequestResponse> getShopReturnRequest(String email){
        return returnRequestRepository.findByShopOwnerEmail(email)
                .stream()
                .map(this::toResponse)
                .toList();
    }
    /**
     * Shop approve return request.
     *
     * REQUESTED → APPROVED
     * Order: RETURN_REQUESTED → RETURNING
     */
    @Transactional
    public ReturnRequestResponse approveReturn(String shopEmail, String orderCode){
        ReturnRequest returnRequest = returnRequestRepository.findByOrderCode(orderCode)
                .orElseThrow(()-> new NotFoundException("Return request not found"));

        validateShopOwnerShip(returnRequest, shopEmail);

        if(returnRequest.getStatus() != ReturnRequestStatus.REQUESTED){
            throw new UnprocessableException("Can not approve. Status: "+returnRequest.getStatus());
        }

        returnRequest.setStatus(ReturnRequestStatus.APPROVED);
        returnRequest.setReviewedAt(LocalDateTime.now());
        returnRequest.setUpdatedAt(LocalDateTime.now());

        Order order = returnRequest.getOrder();
        order.setStatus(OrderStatus.RETURNING);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        ReturnRequest saved = returnRequestRepository.save(returnRequest);
        emailService.sendReturnResultToUser(
                returnRequest.getUser().getEmail(),
                orderCode,
                true,
                null
        );
        log.info("Return approve: orderCode= {} shop= {}", orderCode, shopEmail);
        return toResponse(saved);
    }

    /**
     * Shop xác nhận đã nhận hàng trả về.
     *
     * APPROVED → RETURNING → RETURNED
     * Order: RETURNING → RETURNED
     * Stock: hoàn lại + giảm sold
     */
    @Transactional
    public ReturnRequestResponse confirmReceived(String shopEmail, String orderCode){
        ReturnRequest returnRequest = returnRequestRepository.findByOrderCode(orderCode)
                .orElseThrow(()-> new NotFoundException("Return request not found"));
        validateShopOwnerShip(returnRequest,shopEmail);

        if (returnRequest.getStatus() != ReturnRequestStatus.APPROVED){
            throw new UnprocessableException("Cannot confirm received. Status= "+returnRequest.getStatus());
        }


        // Hoàn stock + giảm sold
        restoreStock(returnRequest.getOrder());

        returnRequest.setStatus(ReturnRequestStatus.RETURNED);
        returnRequest.setUpdatedAt(LocalDateTime.now());

        Order order = returnRequest.getOrder();
        order.setStatus(OrderStatus.RETURNED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        log.info("Return completed: orderCode= {} shop= {}",orderCode, shopEmail);
        return toResponse(returnRequestRepository.save(returnRequest));
    }
    /**
     * Shop từ chối return request.
     *
     * REQUESTED → REJECTED
     * Order: RETURN_REQUESTED → DELIVERED (quay về trạng thái cũ)
     */
    @Transactional
    public ReturnRequestResponse rejectReturn(String shopEmail, String orderCode, String rejectReason){

        ReturnRequest returnRequest = returnRequestRepository.findByOrderCode(orderCode)
                .orElseThrow(()-> new NotFoundException("Return request not found"));

        validateShopOwnerShip(returnRequest, shopEmail);

        if(returnRequest.getStatus() != ReturnRequestStatus.REQUESTED){
            throw new UnprocessableException("Cannot reject. Status: "+returnRequest.getStatus());
        }

        returnRequest.setStatus(ReturnRequestStatus.REJECTED);
        returnRequest.setRejectReason(rejectReason);
        returnRequest.setReviewedAt(LocalDateTime.now());
        returnRequest.setUpdatedAt(LocalDateTime.now());
        // Quay order về DELIVERED
        Order order = returnRequest.getOrder();
        order.setStatus(OrderStatus.DELIVERED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        ReturnRequest saved = returnRequestRepository.save(returnRequest);

        // Gửi email thông báo kết quả cho user
        emailService.sendReturnResultToUser(
                returnRequest.getUser().getEmail(),
                orderCode,
                false,
                rejectReason
        );

        log.info("Return reject: orderCode= {} shop= {}", orderCode, shopEmail);
        return toResponse(saved);
    }


    // ─── Private helpers
    private void validateShopOwnerShip(ReturnRequest returnRequest, String shopEmail){
        boolean belongToShop = returnRequest.getOrder().getItems().stream()
                .anyMatch(item -> item.getShop().getOwner().getEmail().equals(shopEmail));
        if(!belongToShop){
            throw new NotFoundException("Return request not found");
        }
    }


    /**
     * Hoàn stock + giảm sold khi shop nhận lại hàng.
     * Dùng pessimistic lock để tránh race condition.
     */
    private void restoreStock(Order order){
        for (OrderItem item : order.getItems()){
            if (item.getProductId() == null){
                return;
            }

            productRepository.findByIdWithLock(item.getProductId()).ifPresent(product -> {
                product.setStock(product.getStock() + item.getQuantity());
                product.setSold(Math.max(0, product.getSold() - item.getQuantity()));
                productRepository.save(product);
                log.info("Stock restored for return: product={} qty={}",
                        product.getName(), item.getQuantity());
            });
        }
    }

    private ReturnRequestResponse toResponse(ReturnRequest returnRequest){
        return new ReturnRequestResponse(
                returnRequest.getId(),
                returnRequest.getOrder().getOrderCode(),
                returnRequest.getReason(),
                returnRequest.getStatus(),
                returnRequest.getRejectReason(),
                returnRequest.getCreatedAt(),
                returnRequest.getUpdatedAt(),
                returnRequest.getReviewedAt(),
                returnRequest.getUser().getUsername()
        );
    }
}
