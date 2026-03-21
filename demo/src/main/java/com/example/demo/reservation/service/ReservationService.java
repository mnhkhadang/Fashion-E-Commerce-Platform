package com.example.demo.reservation.service;

import com.example.demo.common.exception.ConflictException;
import com.example.demo.common.exception.NotFoundException;
import com.example.demo.common.exception.UnprocessableException;
import com.example.demo.product.entity.Product;
import com.example.demo.product.repository.ProductRepository;
import com.example.demo.reservation.entity.Reservation;
import com.example.demo.reservation.entity.Reservation.ReservationStatus;
import com.example.demo.reservation.repository.ReservationRepository;
import com.example.demo.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationService {

    // TTL mặc định 15 phút — đủ để user hoàn tất thanh toán VNPay
    private static final int RESERVATION_TTL_MINUTES = 15;

    private final ReservationRepository reservationRepository;
    private final ProductRepository productRepository;

    /**
     * Reserve stock cho một sản phẩm.
     *
     * Dùng PESSIMISTIC_WRITE lock để đảm bảo 2 user checkout
     * cùng lúc không thể đều reserve thành công khi stock không đủ.
     *
     * Nếu user đã có reservation ACTIVE cho product này
     * (ví dụ checkout lại trong TTL), sẽ extend TTL thay vì tạo mới.
     */
    @Transactional
    public Reservation reserve(User user, UUID productId, int quantity) {
        // Lock product row để tránh race condition
        Product product = productRepository.findByIdWithLock(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        if (!product.isActive()) {
            throw new UnprocessableException("Product is not available: " + product.getName());
        }

        // availableStock = stock - reservedStock
        if (product.getAvailableStock() < quantity) {
            throw new ConflictException(
                    "Not enough stock for: " + product.getName() +
                            ". Available: " + product.getAvailableStock() +
                            ", requested: " + quantity
            );
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(RESERVATION_TTL_MINUTES);

        // Kiểm tra user đã có reservation ACTIVE cho product này chưa
        // Trường hợp: user checkout → thoát ra → checkout lại trong TTL
        return reservationRepository
                .findByUserIdAndProductIdAndStatus(user.getId(), productId, ReservationStatus.ACTIVE)
                .map(existing -> {
                    // Có reservation cũ còn hạn: cập nhật quantity và extend TTL
                    int quantityDiff = quantity - existing.getQuantity();
                    if (quantityDiff > 0 && product.getAvailableStock() < quantityDiff) {
                        throw new ConflictException(
                                "Not enough stock to update reservation for: " + product.getName()
                        );
                    }
                    // Điều chỉnh reservedStock theo chênh lệch
                    product.setReservedStock(product.getReservedStock() + quantityDiff);
                    productRepository.save(product);

                    existing.setQuantity(quantity);
                    existing.setExpiresAt(expiresAt);
                    log.info("Extended reservation for user={} product={} qty={}",
                            user.getId(), productId, quantity);
                    return reservationRepository.save(existing);
                })
                .orElseGet(() -> {
                    // Tạo reservation mới
                    product.setReservedStock(product.getReservedStock() + quantity);
                    productRepository.save(product);

                    Reservation reservation = new Reservation();
                    reservation.setUser(user);
                    reservation.setProduct(product);
                    reservation.setQuantity(quantity);
                    reservation.setExpiresAt(expiresAt);
                    reservation.setStatus(ReservationStatus.ACTIVE);

                    log.info("Created reservation for user={} product={} qty={} expires={}",
                            user.getId(), productId, quantity, expiresAt);
                    return reservationRepository.save(reservation);
                });
    }

    /**
     * Release một reservation cụ thể.
     *
     * Gọi khi:
     * - User hủy order (PENDING/CONFIRMED)
     * - Payment thất bại
     * - Scheduler cleanup TTL hết hạn
     */
    @Transactional
    public void release(Reservation reservation) {
        if (reservation.getStatus() != ReservationStatus.ACTIVE) {
            // Idempotent: đã release rồi thì bỏ qua
            log.warn("Attempted to release non-ACTIVE reservation id={}", reservation.getId());
            return;
        }

        // Lock product để update reservedStock an toàn
        Product product = productRepository.findByIdWithLock(reservation.getProduct().getId())
                .orElseThrow(() -> new NotFoundException("Product not found during release"));

        int newReservedStock = Math.max(0, product.getReservedStock() - reservation.getQuantity());
        product.setReservedStock(newReservedStock);
        productRepository.save(product);

        reservation.setStatus(ReservationStatus.RELEASED);
        reservationRepository.save(reservation);

        log.info("Released reservation id={} for product={} qty={}",
                reservation.getId(), product.getId(), reservation.getQuantity());
    }

    /**
     * Release tất cả reservation ACTIVE của một list order.
     *
     * Gọi khi cancel payment (hủy toàn bộ đơn hàng trong payment).
     */
    @Transactional
    public void releaseByOrderIds(List<UUID> orderIds) {
        List<Reservation> actives = reservationRepository.findActiveByOrderIds(orderIds);
        actives.forEach(this::release);
    }

    /**
     * Đánh dấu reservation là COMPLETED sau khi thanh toán thành công.
     *
     * Lưu ý: KHÔNG hoàn reservedStock ở đây.
     * Stock thật (stock) sẽ bị trừ trong PaymentService khi confirm.
     * reservedStock sẽ giảm cùng lúc đó.
     */
    @Transactional
    public void complete(Reservation reservation, UUID orderId) {
        if (reservation.getStatus() != ReservationStatus.ACTIVE) {
            throw new UnprocessableException(
                    "Cannot complete reservation id=" + reservation.getId() +
                            " with status=" + reservation.getStatus()
            );
        }
        reservation.setStatus(ReservationStatus.COMPLETED);
        reservation.setOrderId(orderId);
        reservationRepository.save(reservation);

        log.info("Completed reservation id={} linked to order={}",
                reservation.getId(), orderId);
    }

    /**
     * Complete tất cả reservation ACTIVE của user cho một list product.
     *
     * Gọi từ PaymentService sau khi thanh toán thành công,
     * trước khi trừ stock thật.
     */
    @Transactional
    public void completeAll(UUID userId, List<UUID> productIds, UUID orderId) {
        for (UUID productId : productIds) {
            reservationRepository
                    .findByUserIdAndProductIdAndStatus(userId, productId, ReservationStatus.ACTIVE)
                    .ifPresent(r -> complete(r, orderId));
        }
    }

    /**
     * Lấy tất cả reservation ACTIVE của user.
     * Dùng để hiển thị countdown TTL ở checkout page.
     */
    public List<Reservation> getActiveReservations(UUID userId) {
        return reservationRepository.findByUserIdAndStatus(userId, ReservationStatus.ACTIVE);
    }
    @Transactional
    public void releaseByOrderId(UUID orderId) {
        reservationRepository.findActiveByOrderIds(List.of(orderId))
                .forEach(this::release);
    }
}