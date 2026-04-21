package com.example.demo.payment.entity;

public enum PaymentStatus {
    PENDING,    // chờ thanh toán (VNPay chờ callback / COD chờ giao hàng)
    COMPLETED,  // đã thanh toán thành công
    FAILED,     // thanh toán thất bại (VNPay callback lỗi)
    CANCELLED   // bị hủy (user hủy order trước khi thanh toán)
}