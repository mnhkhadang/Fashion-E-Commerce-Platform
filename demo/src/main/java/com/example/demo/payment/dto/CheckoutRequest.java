package com.example.demo.payment.dto;

import com.example.demo.payment.entity.PaymentMethod;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CheckoutRequest {

    private Long shippingAddressId;
    private String note;
    private List<String> slugs;
    private PaymentMethod paymentMethod;
}
