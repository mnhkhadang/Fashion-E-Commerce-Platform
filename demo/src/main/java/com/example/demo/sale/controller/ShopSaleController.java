package com.example.demo.sale.controller;

import com.example.demo.sale.dto.SaleRequest;
import com.example.demo.sale.dto.SaleResponse;
import com.example.demo.sale.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/shop/sales")
public class ShopSaleController {

    private final SaleService saleService;

    // Shop tạo sale riêng
    @PostMapping
    public ResponseEntity<SaleResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody SaleRequest request
    ) {
        return ResponseEntity.ok(saleService.createShopSale(userDetails.getUsername(), request));
    }

    // Shop xem sale của mình
    @GetMapping
    public ResponseEntity<List<SaleResponse>> getMySales(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(saleService.getMySales(userDetails.getUsername()));
    }

    // Shop xem platform sale đang ACTIVE để opt-in
    @GetMapping("/platform")
    public ResponseEntity<List<SaleResponse>> getPlatformSales() {
        return ResponseEntity.ok(saleService.getActivePlatformSales());
    }

    // Shop opt-in sản phẩm vào platform sale
    @PostMapping("/{saleId}/opt-in")
    public ResponseEntity<String> optIn(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long saleId,
            @RequestBody List<String> productIds
    ) {
        saleService.optIn(userDetails.getUsername(), saleId, productIds);
        return ResponseEntity.ok("Opted in successfully");
    }

    // Shop opt-out sản phẩm khỏi sale
    @DeleteMapping("/{saleId}/products/{productId}")
    public ResponseEntity<String> optOut(
            @PathVariable Long saleId,
            @PathVariable String productId
    ) {
        saleService.optOut(saleId, productId);
        return ResponseEntity.ok("Opted out successfully");
    }
}