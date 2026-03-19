package com.example.demo.payment.dto;

import com.example.demo.payment.entity.PaymentMethod;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CheckoutRequest {

    @NotEmpty(message = "Please select at least one item")
    private List<String> slugs;

    @NotNull(message = "Shipping address is required")
    private Long shippingAddressId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;


    private String note;

}
