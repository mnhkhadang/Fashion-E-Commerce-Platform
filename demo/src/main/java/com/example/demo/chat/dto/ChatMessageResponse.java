package com.example.demo.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ChatMessageResponse {

    private Long id;
    private String role;
    private String content;
    private LocalDateTime createdAt;
}
