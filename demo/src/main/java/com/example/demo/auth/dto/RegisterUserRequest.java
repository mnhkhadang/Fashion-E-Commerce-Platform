package com.example.demo.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterUserRequest {

    private String username;
    private String email;
    private String password;
}
