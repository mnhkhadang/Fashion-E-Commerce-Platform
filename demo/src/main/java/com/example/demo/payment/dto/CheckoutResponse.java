package com.example.demo.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class CheckoutResponse {

    private PaymentResponse paymentResponse;

    // Thời điểm reservation hết hạn — frontend dùng để hiển thị countdown
    // null nếu là COD đã confirm ngay
    private LocalDateTime reservationExpiredAt;

    // VNPay redirect URL — chỉ có giá trị khi method = VNPAY
    // null nếu là COD
    private String vnpayUrl;



}
