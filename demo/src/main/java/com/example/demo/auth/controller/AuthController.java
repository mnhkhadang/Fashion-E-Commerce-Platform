package com.example.demo.auth.controller;


import com.example.demo.auth.dto.*;
import com.example.demo.auth.entity.RefreshToken;
import com.example.demo.auth.service.AuthService;
import com.example.demo.auth.service.RefreshTokenService;
import com.example.demo.config.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request){
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword())
        );
        String accessToken = tokenProvider.generateToken(request.getEmail());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(request.getEmail());

        return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken.getToken()));
    }

    @PostMapping("/register/user")
    public ResponseEntity<String> registerUser(@RequestBody RegisterUserRequest request){
        authService.registerUser(request);
        return ResponseEntity.ok("User registered successful");
    }
    @PostMapping("/register/shop")
    public ResponseEntity<String> registerShop(@RequestBody RegisterShopRequest request){
        authService.registerShop(request);
        return ResponseEntity.ok("Shop register successfully");
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.findByToken(request.getRefreshToken());
        refreshTokenService.verifyExpiration(refreshToken);

        String email = refreshToken.getUser().getEmail();
        String newAccessToken = tokenProvider.generateToken(email);

        return ResponseEntity.ok(new AuthResponse(newAccessToken, refreshToken.getToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestBody LogoutRequest request){
        refreshTokenService.deleteByToken(request.getRefreshToken());
        return ResponseEntity.ok("Logout successful");
    }
}
