package com.example.demo.shop.controller;

import com.example.demo.shop.dto.ShopRequest;
import com.example.demo.shop.dto.ShopResponse;
import com.example.demo.shop.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shop")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;

    //cập nhât thông tin shop
    @PutMapping("/profile")
    public ResponseEntity<ShopResponse> updateMyShop(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ShopRequest request
            ){
        return ResponseEntity.ok(shopService.updateShop(userDetails.getUsername(), request));    }

    //xem thông tin shop của mình(Chỉ shop)
    @GetMapping("/profile")
    public ResponseEntity<ShopResponse> getMyShop(
            @AuthenticationPrincipal UserDetails userDetails
    ){
        return ResponseEntity.ok(shopService.getMyShop(userDetails.getUsername()));
    }

    // xem thông tin shop theo id
    @GetMapping
    public ResponseEntity<ShopResponse> getById(@RequestParam String name){
        return ResponseEntity.ok(shopService.getById(name));
    }
}
