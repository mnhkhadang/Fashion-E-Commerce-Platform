package com.example.demo.auth.service;

import com.example.demo.auth.entity.PasswordResetToken;
import com.example.demo.auth.repository.PasswordResetTokenRepository;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final EmailService emailService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    private static final String FRONTEND_URL = "http://localhost:5173";

    @Transactional
    public void forgotPassword(String email){
        //kiểm tra email có tồn tại không - không báo lỗi để tránh user enumeration
        if (!userRepository.existsByEmail(email))
            return;

        //xóa token củ nếu có
        passwordResetTokenRepository.deleteByEmail(email);
        //tạo token mói
        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setEmail(email);
        passwordResetToken.setToken(UUID.randomUUID().toString());
        passwordResetToken.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        passwordResetTokenRepository.save(passwordResetToken);

        //gửi email
        String resetLink = FRONTEND_URL + "/reset-password?token=" + passwordResetToken.getToken();
        emailService.sendPasswordResetEmail(email, resetLink);
    }

    @Transactional
    public void resetPassword(String token , String newPassword){
        PasswordResetToken passwordResetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(()-> new RuntimeException("Token không hợp lệ"));

        if(passwordResetToken.isUsed()){
            throw new RuntimeException("Token đã được sử dụng");
        }

        if(passwordResetToken.getExpiresAt().isBefore(LocalDateTime.now())){
            throw new RuntimeException("Token đã hết hạn");
        }

        if(newPassword.length() < 6){
            throw new RuntimeException("Password phải có ít nhất 6 ký tự");
        }

        User user = userRepository.findByEmail(passwordResetToken.getEmail())
                .orElseThrow( ()-> new RuntimeException("Người dùng không tồn tại"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        passwordResetToken.setUsed(true);
        passwordResetTokenRepository.save(passwordResetToken);
    }

}
