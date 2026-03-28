package com.example.demo.auth.controller;


import com.example.demo.auth.dto.*;
import com.example.demo.auth.entity.RefreshToken;
import com.example.demo.auth.service.AuthService;
import com.example.demo.auth.service.RefreshTokenService;
import com.example.demo.auth.service.UnlockRequestService;
import com.example.demo.common.exception.NotFoundException;
import com.example.demo.config.security.JwtTokenProvider;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final UnlockRequestService unlockRequestService;

    @PostMapping("/login")
    @Transactional
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request){
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword())
        );

        // lấy user info
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("User not found"));

        if(!user.isEnable()){
            throw new DisabledException("Tài khoản bạn đã bị khóa");
        }

        List<String> roles = user.getRoles().stream()
                .map(userRole -> userRole.getRole().getRole())
                .toList();

        String accessToken = tokenProvider.generateToken(request.getEmail());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(request.getEmail());

        return ResponseEntity.ok(new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                user.getEmail(),
                user.getUsername(),
                roles
        ));
    }

    @PostMapping("/register/user")
    public ResponseEntity<String> registerUser(@RequestBody RegisterUserRequest request){
        authService.registerUser(request);
        return ResponseEntity.ok("User registered successful");
    }


    @PostMapping("/refresh")
    @Transactional
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.findByToken(request.getRefreshToken());
        refreshTokenService.verifyExpiration(refreshToken);

        User user = refreshToken.getUser();
        List<String> roles = user.getRoles().stream()
                .map(userRole -> userRole.getRole().getRole())
                .toList();

        String newAccessToken = tokenProvider.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponse(
                newAccessToken,
                refreshToken.getToken(),
                user.getEmail(),
                user.getUsername(),
                roles
        ));
    }

    // User gửi yêu cầu mở khóa — không cần auth
    @PostMapping("/unlock-request")
    public ResponseEntity<String> unlockRequest(
            @RequestParam String email,
            @RequestParam String reason) {
        unlockRequestService.createRequest(email, reason);
        return ResponseEntity.ok("Yêu cầu mở khóa đã được gửi");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestBody LogoutRequest request){
        refreshTokenService.deleteByToken(request.getRefreshToken());
        return ResponseEntity.ok("Logout successful");
    }
}
