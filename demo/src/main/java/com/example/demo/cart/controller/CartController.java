package com.example.demo.cart.controller;

import com.example.demo.cart.dto.CartItemRequest;
import com.example.demo.cart.dto.CartItemUpdateRequest;
import com.example.demo.cart.dto.CartResponse;
import com.example.demo.cart.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;


    //xem giỏ hàng
    @GetMapping
    public ResponseEntity<CartResponse> getCart(
            @AuthenticationPrincipal UserDetails userDetails
            ){
        return ResponseEntity.ok(cartService.getCart(userDetails.getUsername()));
    }

    // Thêm sản phẩm vào giỏ
    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CartItemRequest request
            ){
        return ResponseEntity.ok(cartService.addItem(userDetails.getUsername(), request));
    }

    // cập nhật sản phẩm
    @PutMapping("/items/update")
    public ResponseEntity<CartResponse> updateItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CartItemUpdateRequest request
    ){
        return ResponseEntity.ok(cartService.updateItem(userDetails.getUsername(),request));
    }

    // Xóa sản phẩm khỏi giỏ
    @DeleteMapping("/items")
    public ResponseEntity<CartResponse> removeItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String slug) {
        return ResponseEntity.ok(cartService.removeItem(userDetails.getUsername(), slug));
    }

    //xóa toàn bộ giỏ hàng
    @DeleteMapping("/clear")
    public ResponseEntity<String> clearCart(
            @AuthenticationPrincipal UserDetails userDetails
    ){
        cartService.clearCart(userDetails.getUsername());
        return ResponseEntity.ok("Cart cleared");
    }
}
