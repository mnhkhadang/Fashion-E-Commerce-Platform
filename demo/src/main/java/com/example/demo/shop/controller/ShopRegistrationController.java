package com.example.demo.shop.controller;


import com.example.demo.shop.dto.ShopRegistrationRequest;
import com.example.demo.shop.dto.ShopRegistrationResponse;
import com.example.demo.shop.repository.ShopRegistrationRepository;
import com.example.demo.shop.service.ShopRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/shop-registrations")
public class ShopRegistrationController {

    private final ShopRegistrationService shopRegistrationService;

    //user gủi đơn
    @PostMapping
    public ResponseEntity<ShopRegistrationResponse> register(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ShopRegistrationRequest request
            ){
        return ResponseEntity.ok(shopRegistrationService.register(userDetails.getUsername(),request));
    }

    //user xem trạng thái đơn của mình

    @GetMapping("/my")
    public ResponseEntity<ShopRegistrationResponse> getMyRegistration(
            @AuthenticationPrincipal UserDetails userDetails
    ){
        return ResponseEntity.ok(shopRegistrationService.getMyRegistration(userDetails.getUsername()));
    }

    //admin lấy danh sách tất cả đơn

    @GetMapping
    public ResponseEntity<List<ShopRegistrationResponse>> getAllRegistration() {
        return ResponseEntity.ok(shopRegistrationService.getAllRegistration());
    }

    //admin duyệt
    @PostMapping("{id}/approve")
    public  ResponseEntity<ShopRegistrationResponse> approve(@PathVariable UUID id){
        return ResponseEntity.ok(shopRegistrationService.approve(id));
    }

    //admin từ chối đơn
    @PostMapping("{id}/reject")
    public ResponseEntity<ShopRegistrationResponse> reject(@PathVariable UUID id,
                                                           @RequestParam String reason){
        return  ResponseEntity.ok(shopRegistrationService.reject(id, reason));
    }
}
