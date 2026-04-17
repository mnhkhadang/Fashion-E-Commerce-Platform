package com.example.demo.sale.controller;


import com.example.demo.sale.dto.SaleRequest;
import com.example.demo.sale.dto.SaleResponse;
import com.example.demo.sale.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/sales")
public class AdminSaleController {

    private final SaleService saleService;


    @PostMapping
    public ResponseEntity<SaleResponse> create (
            @RequestBody SaleRequest request){
        return ResponseEntity.ok(saleService.createPlatformSale(request));
    }

    @GetMapping
    public ResponseEntity<List<SaleResponse>> getAll() {
        return ResponseEntity.ok(saleService.getAllPlatformSales());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        saleService.deleteSale(id);
        return ResponseEntity.ok("Sale deleted successfully");
    }
}
