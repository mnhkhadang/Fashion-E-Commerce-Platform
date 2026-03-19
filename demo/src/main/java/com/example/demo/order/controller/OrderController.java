package com.example.demo.order.controller;


import com.example.demo.order.dto.OrderResponse;
import com.example.demo.order.entity.OrderStatus;
import com.example.demo.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    //user xem danh sách don hàng
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails
    ){
        return ResponseEntity.ok(orderService.getMyOrders(userDetails.getUsername()));
    }

    //user xem chi tiết đơn hàng
    @GetMapping("/{orderCode}")
    public ResponseEntity<OrderResponse> getByOrderCode(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String orderCode
    ){
        return ResponseEntity.ok(orderService.getByOrderCode(userDetails.getUsername(), orderCode));
    }

    // user hủy đơn hàng, Thêm cancelReason từ request body
    @PostMapping("/{orderCode}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String orderCode,
            @RequestParam(required = false, defaultValue = "Cancel by user") String reason
    ){
        return ResponseEntity.ok(orderService.cancelOrder(userDetails.getUsername(), orderCode, reason));
    }

    //Shop xem danh sach1
    @GetMapping("/shop")
    public ResponseEntity<List<OrderResponse>> getShopOrders(
            @AuthenticationPrincipal UserDetails userDetails
    ){
        return ResponseEntity.ok(orderService.getShopOrders(userDetails.getUsername()));
    }

    // shop cập nhật trạng thái đơn hàng
    @PutMapping("{orderCode}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String orderCode,
            @RequestParam OrderStatus orderStatus
    ){
        return ResponseEntity.ok(orderService.updateStatus(userDetails.getUsername(), orderCode,orderStatus));
    }



}
