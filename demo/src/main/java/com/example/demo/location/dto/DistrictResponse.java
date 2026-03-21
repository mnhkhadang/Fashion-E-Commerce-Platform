package com.example.demo.location.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class DistrictResponse {

    private Integer code;
    private String name;
    private Integer provinceCode;
}
