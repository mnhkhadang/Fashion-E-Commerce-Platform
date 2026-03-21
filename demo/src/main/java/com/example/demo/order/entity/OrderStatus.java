package com.example.demo.order.entity;

public enum OrderStatus {
    PENDING,            // vừa tạo, chờ confirm (COD) hoặc chờ payment callback (VNPay)
    CONFIRMED,          // đã xác nhận — shop bắt đầu chuẩn bị hàng
    SHIPPING,           // đang giao hàng
    DELIVERED,          // đã giao thành công
    CANCELLED,          // đã hủy (chỉ từ PENDING hoặc CONFIRMED)
    RETURN_REQUESTED,   // user đã tạo yêu cầu trả hàng
    RETURNING,          // shop đã approve, đang chờ nhận hàng trả
    RETURNED            // shop đã nhận hàng trả, hoàn stock xong
}