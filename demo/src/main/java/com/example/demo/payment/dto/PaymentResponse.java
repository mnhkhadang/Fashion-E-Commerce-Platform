package com.example.demo.payment.dto;

import com.example.demo.order.dto.OrderResponse;
import com.example.demo.payment.entity.PaymentMethod;
import com.example.demo.payment.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class PaymentResponse {

    private String paymentCode;
    private PaymentMethod method;
    private PaymentStatus status;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
    private List<OrderResponse> orders;
}
