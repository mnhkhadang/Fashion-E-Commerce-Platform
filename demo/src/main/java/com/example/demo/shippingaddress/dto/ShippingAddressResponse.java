package com.example.demo.shippingaddress.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ShippingAddressResponse {

    private Long id;
    private String fullName;
    private String phone;
    private String streetAddress;
    private String provinceName;
    private String districtName;
    private boolean isDefault;
}
