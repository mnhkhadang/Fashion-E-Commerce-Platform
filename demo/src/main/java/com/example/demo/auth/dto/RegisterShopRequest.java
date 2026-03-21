package com.example.demo.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterShopRequest {
    //thông tin user
    private String username;
    private String email;
    private String password;

    //thông tin shop
    private String shopName;
    private String description;
    private String phone;
    private String address;
    private String avatar;
}
