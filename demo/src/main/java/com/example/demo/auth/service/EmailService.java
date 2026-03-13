package com.example.demo.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String toEmail, String resetLink){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@shopvn.com");
        message.setTo(toEmail);
        message.setSubject("[ShopVN] Đặt lại mật khẩu");
        message.setText(
                "Xin chào,\n\n" +
                        "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n\n" +
                        "Click vào link dưới đây để đặt lại mật khẩu (có hiệu lực trong 15 phút):\n\n" +
                        resetLink + "\n\n" +
                        "Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.\n\n" +
                        "Trân trọng,\nShopVN"
        );
        mailSender.send(message);
    }
}
