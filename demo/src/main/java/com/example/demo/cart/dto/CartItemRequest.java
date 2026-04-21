package com.example.demo.cart.dto;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.Min;
import java.util.UUID;

@Getter
@Setter
public class CartItemRequest {

    private String slug;

    @Min(value = 1, message = "Quantity must be greater than 0")
    private int quantity;
}
