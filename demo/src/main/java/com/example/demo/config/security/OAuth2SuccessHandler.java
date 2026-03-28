package com.example.demo.config.security;

import com.example.demo.auth.entity.RefreshToken;
import com.example.demo.auth.service.RefreshTokenService;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/oauth2/callback}")
    private String redirectUri;

    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // Lấy email từ OAuth2 attributes
        String email = extractEmail(oAuth2User);

        if (email == null) {
            log.error("OAuth2 success but email is null");
            response.sendRedirect(redirectUri + "?error=email_not_found");
            return;
        }

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null || !user.isEnable()) {
            log.warn("OAuth2 user not found or disabled: {}", email);
            response.sendRedirect(redirectUri + "?error=user_disabled");
            return;
        }

        // Lấy roles
        List<String> roles = user.getRoles().stream()
                .map(userRole -> userRole.getRole().getRole())
                .toList();

        // Tạo JWT tokens
        String accessToken = tokenProvider.generateToken(email);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(email);

        // Redirect về frontend kèm tokens trong URL
        String targetUrl = UriComponentsBuilder
                .fromUriString(redirectUri)
                .queryParam("token", accessToken)
                .queryParam("refreshToken", refreshToken.getToken())
                .queryParam("email", email)
                .queryParam("username", URLEncoder.encode(user.getUsername(), StandardCharsets.UTF_8))
                .build().toUriString();

        log.info("OAuth2 success redirect: email={}", email);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private String extractEmail(OAuth2User oAuth2User) {
        // Google trả về email trực tiếp
        String email = oAuth2User.getAttribute("email");
        return email;
    }
}