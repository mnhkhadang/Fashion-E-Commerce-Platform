package com.example.demo.cart.dto;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemUpdateRequest {

    private String slug;
    @Min(value = 1, message = "Quantity must be greater than 1")
    private int quantity;
}
