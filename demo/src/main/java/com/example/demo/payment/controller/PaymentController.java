package com.example.demo.payment.controller;

import com.example.demo.payment.dto.CheckoutRequest;
import com.example.demo.payment.dto.PaymentResponse;
import com.example.demo.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    //checkout
    @PostMapping("/checkout")
    public ResponseEntity<PaymentResponse> checkout(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CheckoutRequest request
            ){
        return ResponseEntity.ok(paymentService.checkout(userDetails.getUsername(),request));
    }
    //xem danh sách payment của mình
    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getMyPayments(
            @AuthenticationPrincipal UserDetails userDetails
    ){
        return ResponseEntity.ok(paymentService.getMyPayments(userDetails.getUsername()));
    }
    //xem chi tiết payment
    @GetMapping("{paymentCode}")
    public ResponseEntity<PaymentResponse> getByPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String paymentCode
    ){
        return ResponseEntity.ok(paymentService.getByPayment(userDetails.getUsername(),paymentCode));
    }
}
