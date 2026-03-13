package com.example.demo.user.service;


import com.example.demo.user.dto.ChangePasswordRequest;
import com.example.demo.user.dto.UpdateProfileRequest;
import com.example.demo.user.dto.UserProfileResponse;
import com.example.demo.user.entity.User;
import com.example.demo.user.entity.UserRole;
import com.example.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    //xem thông tin profile
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String email){
        User user = userRepository.findByEmail(email)
                .orElseThrow( ()-> new RuntimeException("User not found"));
        return toResponse(user);
    }

    //update user name
    @Transactional
    public UserProfileResponse updateUserName(String email, UpdateProfileRequest request){
        User user = userRepository.findByEmail(email)
                .orElseThrow( ()-> new RuntimeException("User not found"));
        user.setUsername(request.getUsername());
        return toResponse(userRepository.save(user));
    }

    //đổi mật khẩu
    @Transactional
    public void  changePassword(String email, ChangePasswordRequest request){
        User user = userRepository.findByEmail(email)
                .orElseThrow( ()-> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())){
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }

        if (request.getNewPassword().length()< 6){
            throw new RuntimeException("Mật khẩu phải có ít nhất 6 ký tự.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private UserProfileResponse toResponse(User user){
        return new UserProfileResponse(
                user.getEmail(),
                user.getUsername(),
                user.isEnable(),
                user.getRoles().stream()
                        .map(ur -> ur.getRole().getRole())
                        .toList()
        );
    }
}
