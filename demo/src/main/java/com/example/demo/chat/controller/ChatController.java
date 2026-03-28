package com.example.demo.chat.controller;

import com.example.demo.chat.dto.ChatMessageResponse;
import com.example.demo.chat.dto.ChatRequest;
import com.example.demo.chat.dto.SessionResponse;
import com.example.demo.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // Tạo session mới
    @PostMapping("/sessions")
    public ResponseEntity<SessionResponse> createSession(
            @AuthenticationPrincipal UserDetails userDetails
    ){
        return ResponseEntity.ok(chatService.createSession(userDetails.getUsername()));
    }

    // Lấy tất cả sessions của user
    @GetMapping("/sessions")
    public ResponseEntity<List<SessionResponse>> getMySession(
            @AuthenticationPrincipal UserDetails userDetails
    ){
        return ResponseEntity.ok(chatService.getMySessions(userDetails.getUsername()));
    }

    // Lấy lịch sử messages của 1 session
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String sessionId) {
        return ResponseEntity.ok(
                chatService.getMessages(userDetails.getUsername(), sessionId));
    }

    //xóa session
    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<String> deleteSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String sessionId
    ){
        chatService.deleteSession(userDetails.getUsername(), sessionId);
        return ResponseEntity.ok("Session deleted");

    }

    // ⭐ Gửi message → nhận streaming response (SSE)
    // produces: text/event-stream để browser nhận từng chunk
    @PostMapping(value = "/session/{sessionId}/message",
        produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter sseMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String sessionId,
            @RequestBody ChatRequest request
    ){
        return chatService.streamChat(userDetails.getUsername(), sessionId,request.getMessage());
    }

}
