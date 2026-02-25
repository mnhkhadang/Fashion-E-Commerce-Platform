package com.example.demo.shippingaddress.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShippingAddressRequest {
    private String fullName;
    private String phone;
    private String streetAddress;
    private Integer provinceCode;
    private Integer districtCode;
    private boolean isDefault;
}
