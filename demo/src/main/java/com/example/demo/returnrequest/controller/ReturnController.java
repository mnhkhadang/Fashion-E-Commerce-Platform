package com.example.demo.returnrequest.controller;

import com.example.demo.returnrequest.dto.ReturnRequestResponse;
import com.example.demo.returnrequest.service.ReturnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.parameters.P;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/returns")
@RequiredArgsConstructor
public class ReturnController {

    private final ReturnService returnService;

    // ─── User

    // User tạo return reques
    @PostMapping("/{orderCode}")
    public ResponseEntity<ReturnRequestResponse> requestReturn(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String orderCode,
            @RequestParam String reason
            ){
        return ResponseEntity.ok(returnService.requestReturn(userDetails.getUsername(), orderCode, reason));
    }
    //user xem danh sách của mình
    @GetMapping()
    public ResponseEntity<List<ReturnRequestResponse>> getMyRequestReturns(
            @AuthenticationPrincipal UserDetails userDetails
    ){
        return ResponseEntity.ok(returnService.getMyReturnRequests(userDetails.getUsername()));
    }

    // ─── Shop
    // Shop xem tất cả return request của shop mình
    @GetMapping("/shop")
    public ResponseEntity<List<ReturnRequestResponse>> getShopReturnRequest(
            @AuthenticationPrincipal UserDetails userDetails
    ){
        return ResponseEntity.ok(returnService.getShopReturnRequest(userDetails.getUsername()));
    }

    // Shop approve return request
    @PutMapping("/{orderCode}/approve")
    public ResponseEntity<ReturnRequestResponse> approveReturn(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String orderCode
    ){
        return ResponseEntity.ok(returnService.approveReturn(userDetails.getUsername(), orderCode));
    }

    // Shop xác nhận đã nhận hàng trả về
    @PutMapping("/{orderCode}/received")
    public ResponseEntity<ReturnRequestResponse> confirmReceived(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String orderCode
    ){
        return ResponseEntity.ok(returnService.confirmReceived(userDetails.getUsername(), orderCode));
    }

    // Shop reject return request
    @PutMapping("/{orderCode}/reject")
    public ResponseEntity<ReturnRequestResponse>  rejectReturn(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String orderCode,
            @RequestParam String rejectReason
    ){
        return ResponseEntity.ok(returnService.rejectReturn(userDetails.getUsername(), orderCode,rejectReason));
    }

}
