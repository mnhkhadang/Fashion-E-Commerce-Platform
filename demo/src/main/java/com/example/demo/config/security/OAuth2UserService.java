package com.example.demo.config.security;

import com.example.demo.role.entity.Role;
import com.example.demo.role.repository.RoleRepository;
import com.example.demo.user.entity.User;
import com.example.demo.user.entity.UserRole;
import com.example.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId(); // "google" | "facebook"
        Map<String, Object> attributes = oAuth2User.getAttributes();

        // Extract thông tin từ provider
        String email = extractEmail(provider, attributes);
        String name = extractName(provider, attributes);
        String avatar = extractAvatar(provider, attributes);
        String providerId = extractProviderId(provider, attributes);

        if (email == null || email.isBlank()) {
            log.error("OAuth2 email is null from provider: {}", provider);
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        // Tìm user theo email
        User user = userRepository.findByEmail(email)
                .map(existingUser -> updateExistingUser(existingUser, provider, providerId, name, avatar))
                .orElseGet(() -> createNewUser(email, name, avatar, provider, providerId));

        log.info("OAuth2 login: email={} provider={}", email, provider);
        return oAuth2User;
    }

    // ─── Update user cũ (link account) ──────────────────────────────────────

    private User updateExistingUser(User user, String provider, String providerId,
                                    String name, String avatar) {
        // Tự động link với account cũ nếu cùng email
        if ("local".equals(user.getProvider())) {
            user.setProvider(provider);
            user.setProviderId(providerId);
            log.info("Linked existing account {} with {}", user.getEmail(), provider);
        }
        // Update avatar nếu chưa có
        if (user.getAvatar() == null && avatar != null) {
            user.setAvatar(avatar);
        }
        return userRepository.save(user);
    }

    // ─── Tạo user mới ───────────────────────────────────────────────────────

    private User createNewUser(String email, String name, String avatar,
                               String provider, String providerId) {
        Role userRole = roleRepository.findByRole("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("ROLE_USER not found"));

        User user = new User();
        user.setEmail(email);
        user.setUsername(name != null ? name : email.split("@")[0]);
        user.setPassword(null);
        user.setProvider(provider);
        user.setProviderId(providerId);
        user.setAvatar(avatar);
        user.setEnable(true);

        User savedUser = userRepository.save(user);

        UserRole userRoleEntity = new UserRole();
        userRoleEntity.setUser(savedUser);
        userRoleEntity.setRole(userRole);  // ← thêm dòng này

        List<UserRole> roles = new ArrayList<>();
        roles.add(userRoleEntity);
        savedUser.setRoles(roles);
        // ← xóa dòng List.of()

        return userRepository.save(savedUser);
    }
    // ─── Extract helpers ─────────────────────────────────────────────────────

    private String extractEmail(String provider, Map<String, Object> attributes) {
        return switch (provider) {
            case "google" -> (String) attributes.get("email");
            case "facebook" -> (String) attributes.get("email");
            default -> null;
        };
    }

    private String extractName(String provider, Map<String, Object> attributes) {
        return switch (provider) {
            case "google" -> (String) attributes.get("name");
            case "facebook" -> (String) attributes.get("name");
            default -> null;
        };
    }

    private String extractAvatar(String provider, Map<String, Object> attributes) {
        return switch (provider) {
            case "google" -> (String) attributes.get("picture");
            case "facebook" -> {
                // Facebook trả về picture dạng object
                Object picture = attributes.get("picture");
                if (picture instanceof Map<?, ?> pictureMap) {
                    Object data = pictureMap.get("data");
                    if (data instanceof Map<?, ?> dataMap) {
                        yield (String) dataMap.get("url");
                    }
                }
                yield null;
            }
            default -> null;
        };
    }

    private String extractProviderId(String provider, Map<String, Object> attributes) {
        return switch (provider) {
            case "google" -> (String) attributes.get("sub");
            case "facebook" -> (String) attributes.get("id");
            default -> null;
        };
    }
}