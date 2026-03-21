package com.example.demo.shop.dto;

import com.example.demo.shop.entity.ShopRegistration;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class ShopRegistrationResponse {

    private UUID id;
    private String shopName;
    private String description;
    private String address;
    private String phone;
    private String avatar;
    private ShopRegistration.RegistrationStatus status;
    private String rejectReason;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
    private String ownerEmail;
    private String ownerUsername;

}
