package com.example.demo.cart.service;

import com.example.demo.cart.dto.CartItemRequest;
import com.example.demo.cart.dto.CartItemUpdateRequest;
import com.example.demo.cart.dto.CartResponse;
import com.example.demo.cart.entity.Cart;
import com.example.demo.cart.entity.CartItem;
import com.example.demo.cart.repository.CartItemRepository;
import com.example.demo.cart.repository.CartRepository;
import com.example.demo.product.entity.Product;
import com.example.demo.product.repository.ProductRepository;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // lay or tạo cart cho user
    private Cart getOrCreateCart(String email){
        return cartRepository.findByOwnerEmail(email).orElseGet(()->{
            User user = userRepository.findByEmail(email)
                    .orElseThrow(()-> new RuntimeException("User not found"));
            Cart cart = new Cart();
            cart.setOwner(user);
            return cartRepository.save(cart);
        });
    }

    // xem giỏ hàng
    public CartResponse getCart(String email){
        Cart cart = getOrCreateCart(email);
        return toResponse(cart);
    }
    /**
     * Thêm sản phẩm vào giỏ hàng.
     *
     * Validate dùng availableStock (stock - reservedStock) thay vì stock thô
     * để tránh thêm sản phẩm đang bị hold bởi user khác.
     *
     * Lưu addedPrice = giá hiện tại tại thời điểm thêm vào cart
     * → dùng để so sánh và cảnh báo khi giá thay đổi.
     *
     * Nếu sản phẩm đã có trong cart → cộng thêm quantity, cập nhật addedPrice
     * theo giá mới nhất (user chủ động thêm lại = chấp nhận giá hiện tại).
     */
    @Transactional
    public CartResponse addItem(String email, CartItemRequest request){
        Cart cart = getOrCreateCart(email);
        Product product = productRepository.findBySlug(request.getSlug())
                .orElseThrow(()-> new RuntimeException("Product not found"));
        if(!product.isActive()){
            throw new RuntimeException("Product is not available");
        }
        // Dùng availableStock thay vì stock thô
        if (product.getAvailableStock() < request.getQuantity()){
            throw new RuntimeException("Not enough stock");
        }

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        if(existingItemOpt.isPresent()){
            CartItem existingItem = existingItemOpt.get();
            int newQty = existingItem.getQuantity() + request.getQuantity();
            if(product.getAvailableStock() < newQty){
                throw new RuntimeException("Not enough stock");
            }
            existingItem.setQuantity(newQty);
            // Cập nhật addedPrice khi user chủ động thêm lại
            // → xem như user đã acknowledge giá mới
            existingItem.setAddedPrice(product.getPrice());
        }else{
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            newItem.setAddedPrice(product.getPrice());
            cart.getItems().add(newItem);
        }

        return toResponse(cartRepository.save(cart));


    }

    /**
     * Cập nhật số lượng sản phẩm trong giỏ hàng.
     * quantity <= 0 → xóa item.
     */
    @Transactional
    public CartResponse updateItem(String email, CartItemUpdateRequest request){
        Cart cart = getOrCreateCart(email);

        Product product = productRepository.findBySlug(request.getSlug())
                .orElseThrow(()-> new RuntimeException("Product not found"));

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId() )
                .orElseThrow(()-> new RuntimeException("Cart item not found"));
        // kiểm tra item có thuộc cart này hong
        if(!item.getCart().getId().equals(cart.getId())){
            throw new RuntimeException("Cart item not found");
        }

        if(request.getQuantity() <= 0){
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        }else {
            // Dùng availableStock
            if (product.getAvailableStock() < request.getQuantity()){
                throw new RuntimeException("Not enough stock");
            }
            item.setQuantity(request.getQuantity());
            // Không cập nhật addedPrice ở đây —
            // user chỉ đổi số lượng, không có nghĩa là acknowledge giá mới
        }
        return toResponse(cartRepository.save(cart));

    }

    //xóa sp khỏi giỏ hàng
    @Transactional
    public CartResponse removeItem(String email, String slug){
        Cart cart = getOrCreateCart(email);
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(()-> new RuntimeException("Product not found"));

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElseThrow(()-> new RuntimeException("Cart item not found"));

        cart.getItems().remove((item));
        cartItemRepository.delete(item);
        return toResponse(cartRepository.save(cart));
    }

    //Xóa toàn bộ giỏ hàng
    @Transactional
    public void clearCart(String email){
        Cart cart = getOrCreateCart(email);
        cart.getItems().clear();
        cartRepository.save(cart);
    }


    //
    private CartResponse toResponse(Cart cart){
        List<CartResponse.CartItemResponse> itemResponses = cart.getItems()
                .stream()
                .map(item -> {
                    Product product = item.getProduct();
                    BigDecimal currentPrice = product.getPrice();
                    BigDecimal addedPrice = item.getAddedPrice();


                    boolean inactive = !product.isActive();
                    boolean outOfStock = product.getAvailableStock() < item.getQuantity();
                    // Chỉ cảnh báo giá nếu có addedPrice (data sau V6)
                    // và giá thực sự thay đổi
                    boolean priceChanged = addedPrice != null &&
                            currentPrice.compareTo(addedPrice) != 0;

                    BigDecimal subtTotal = currentPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

                    return  new CartResponse.CartItemResponse(
                            item.getId(),
                            product.getName(),
                            product.getSlug(),
                            currentPrice,
                            addedPrice,
                            item.getQuantity(),
                            subtTotal,
                            priceChanged,
                            outOfStock,
                            inactive
                    );
                }).toList();
        // Tổng tiền chỉ tính item hợp lệ (không inactive, không outOfStock)
        BigDecimal totalPrice = itemResponses.stream()
                .filter(i -> i.isInactive() && !i.isOutOfStock())
                .map(CartResponse.CartItemResponse::getSubTotal)
                .reduce(BigDecimal.ZERO,BigDecimal::add);
        boolean hasWarning = itemResponses.stream()
                .anyMatch(i -> i.isPriceChanged() || i.isOutOfStock() || i.isInactive());

        return new CartResponse(cart.getId(), itemResponses, totalPrice, hasWarning);
    }
}
