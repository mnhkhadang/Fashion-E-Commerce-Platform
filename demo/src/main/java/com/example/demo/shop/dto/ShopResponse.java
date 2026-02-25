package com.example.demo.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class ShopResponse {

    private UUID id;
    private String name;
    private String description;
    private String address;
    private String phone;
    private String avatar;
    private boolean active;
    private String ownerEmail;
}
