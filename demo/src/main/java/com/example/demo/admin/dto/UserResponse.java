package com.example.demo.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class UserResponse {

    private UUID id;
    private String username;
    private String email;
    private boolean enable;
    private List<String> role;

}
