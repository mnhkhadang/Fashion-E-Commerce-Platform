package com.example.demo.product.controller;

import com.example.demo.product.dto.ProductRequest;
import com.example.demo.product.dto.ProductResponse;
import com.example.demo.product.service.ProductService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    //shop đăng sản phẩm
    @PostMapping
    public ResponseEntity<ProductResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ProductRequest request
            ){
        return ResponseEntity.ok(productService.create(userDetails.getUsername(),request));
    }

    //shop cập nhật sản phẩm
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody ProductRequest request
            ){
        return ResponseEntity.ok(productService.update(userDetails.getUsername(),id,request));
    }

    //shop ẩn hiện sản phảm
    @PostMapping("/{id}/toggle")
    public ResponseEntity<String> toggleActive(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id
            ){
        productService.toggleActive(userDetails.getUsername(),id);
        return ResponseEntity.ok("Product status updated");
    }

    //Shop xem sản phảm của mình
    @GetMapping("/my")
    public ResponseEntity<List<ProductResponse>> getMyProducts(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(productService.getMyProducts(userDetails.getUsername()));
    }

    // tỉm kiếm sản phẩm
    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>> search(@RequestParam String keyword){
        return ResponseEntity.ok(productService.seacrch(keyword));
    }
    //xem sản phẩm theo categoryName
    @GetMapping("/category")
    public ResponseEntity<List<ProductResponse>> getByCategory(@RequestParam String categoryName) {
        return ResponseEntity.ok(productService.getByCategory(categoryName));
    }

    // lấy tất cả sản phẩm
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAll(){
        return ResponseEntity.ok(productService.getAll());
    }

    //lấy chi tiết sản phẩm theo slug
    @GetMapping("/{slug}")
    public ResponseEntity<ProductResponse> getBySlug(@PathVariable  String slug){
        return ResponseEntity.ok(productService.getBySlug(slug));
    }

    // Lấy sản phẩm theo tên shop (public)

    @GetMapping("/shop")
    public ResponseEntity<List<ProductResponse>> getByShop(@RequestParam String shopName) {
        return ResponseEntity.ok(productService.getByShop(shopName));
    }
}
