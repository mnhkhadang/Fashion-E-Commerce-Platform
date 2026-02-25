package com.example.demo.admin.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignRoleRequest {

    private String email;
    private String role;
}
