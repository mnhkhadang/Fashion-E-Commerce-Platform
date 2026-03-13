package com.example.demo.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class UserProfileResponse {
    private String email;
    private String username;
    private boolean enable;
    private List<String> roles;
}
