package com.example.demo.admin.controller;

import com.example.demo.admin.dto.AssignRoleRequest;
import com.example.demo.admin.dto.UserResponse;
import com.example.demo.admin.service.AdminService;
import com.example.demo.shop.dto.ShopResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    //lấy danh sách user
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers(){
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    //gán role cho user
    @PostMapping("/users/assign-role")
    public ResponseEntity<String> assignRole(@RequestBody AssignRoleRequest request){
        adminService.assignRole(request.getEmail(), request.getRole());
        return ResponseEntity.ok("Role assigned successfully");
    }

    //gỡ role khỏi user
    @PostMapping("/users/remove-role")
    public ResponseEntity<String> removeRole(@RequestBody AssignRoleRequest request){
        adminService.removeRole(request.getEmail(), request.getRole());
        return ResponseEntity.ok("Role removed successfully");
    }

    //Tạo role mói
    @PostMapping("/roles")
    public ResponseEntity<String> createRole(@RequestBody AssignRoleRequest request){
        adminService.createRole(request.getRole());
        return ResponseEntity.ok("Role created successfully");
    }

    //Khóa ?? mở user
    @PostMapping("/users/toggle")
    public ResponseEntity<String> toggleUser(@RequestParam String email){
        adminService.toggleUserEnable(email);
        return ResponseEntity.ok("User status updated");
    }

    //khóa mở shop
    @PostMapping("/shops/toggle")
    public ResponseEntity<String> toggleShop(@RequestParam String email){
        adminService.toggleShopEnable(email);
        return ResponseEntity.ok("Shop status updated");
    }
    @GetMapping("/shops")
    public ResponseEntity<List<ShopResponse>> getAllShop() {
        return ResponseEntity.ok(adminService.getAllShops());
    }
}
