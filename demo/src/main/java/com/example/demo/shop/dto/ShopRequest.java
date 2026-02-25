package com.example.demo.shop.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShopRequest {
    private String name;
    private String description;
    private String address;
    private String phone;
    private String avatar;
}
