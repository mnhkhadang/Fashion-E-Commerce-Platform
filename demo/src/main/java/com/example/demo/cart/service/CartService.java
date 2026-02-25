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
    // thêm sp vào giỏ hàng
    @Transactional
    public CartResponse addItem(String email, CartItemRequest request){
        Cart cart = getOrCreateCart(email);
        Product product = productRepository.findBySlug(request.getSlug())
                .orElseThrow(()-> new RuntimeException("Product not found"));
        if(!product.isActive()){
            throw new RuntimeException("Product is not available");
        }
        if(product.getStock() < request.getQuantity()){
            throw new RuntimeException("Not enough stock");
        }

        // kiểm tra sp đã có trong giỏ hàng chưa
        cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .ifPresentOrElse(
                        existingItem -> existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity()),
                        ()->{
                            CartItem newItem = new CartItem();
                            newItem.setCart(cart);
                            newItem.setProduct(product);
                            newItem.setQuantity(request.getQuantity());
                            cart.getItems().add(newItem);
                        }
                );

        return toResponse(cartRepository.save(cart));
    }
    // Cập nhật số lượng
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
            if(item.getProduct().getStock() < request.getQuantity()){
                throw new RuntimeException("Not enough stock");
            }
            item.setQuantity(request.getQuantity());
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
        if(!item.getCart().getId().equals(cart.getId())){
            throw new RuntimeException("Cart item not found");
        }
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
                .map(item -> new CartResponse.CartItemResponse(
                        item.getId(),
                        item.getProduct().getName(),
                        item.getProduct().getSlug(),
                        item.getProduct().getPrice(),
                        item.getQuantity(),
                        item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
                )).toList();
        BigDecimal totalPrice = itemResponses.stream()
                .map(CartResponse.CartItemResponse::getSubTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartResponse(cart.getId(), itemResponses, totalPrice);
    }
}
