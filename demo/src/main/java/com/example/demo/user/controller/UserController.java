package com.example.demo.user.controller;


import com.example.demo.user.dto.ChangePasswordRequest;
import com.example.demo.user.dto.UpdateProfileRequest;
import com.example.demo.user.dto.UserProfileResponse;
import com.example.demo.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    //xem thông tin profile
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails
            ){
        return ResponseEntity.ok(userService.getProfile(userDetails.getUsername()));
    }

    //update username
    @PutMapping("/profile")
    public ResponseEntity<String> updateUserName(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequest request
            ){
        userService.updateUserName(userDetails.getUsername(), request);
        return ResponseEntity.ok("Đổi tên tài khoản thành công");
    }

    //đổi mật khẩu
    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChangePasswordRequest request
    ){
        userService.changePassword(userDetails.getUsername(),request);
        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }
}
