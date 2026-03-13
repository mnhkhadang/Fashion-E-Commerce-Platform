package com.example.demo.auth.controller;

import com.example.demo.auth.dto.ForgotPasswordRequest;
import com.example.demo.auth.dto.ResetPasswordRequest;
import com.example.demo.auth.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @RequestBody ForgotPasswordRequest request
            ){
        passwordResetService.forgotPassword(request.getEmail());
        return ResponseEntity.ok("Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu");
    }

    @PostMapping("/reset-password")
    public  ResponseEntity<String> resetPassword(
            @RequestBody ResetPasswordRequest request
            ){
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("Đặt lại mật khẩu thành công");
    }
}
