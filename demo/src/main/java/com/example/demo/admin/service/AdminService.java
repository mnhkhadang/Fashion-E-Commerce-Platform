package com.example.demo.admin.service;

import com.example.demo.admin.dto.UserResponse;
import com.example.demo.role.entity.Role;
import com.example.demo.role.repository.RoleRepository;
import com.example.demo.shop.dto.ShopResponse;
import com.example.demo.shop.entity.Shop;
import com.example.demo.shop.repository.ShopRepository;
import com.example.demo.user.entity.User;
import com.example.demo.user.entity.UserRole;
import com.example.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ShopRepository shopRepository;

    // lấy danh sách all user
    public List<UserResponse> getAllUsers(){
        return userRepository.findAllWithRoles()
                .stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.isEnable(),
                        user.getRoles().stream()
                                .map(ur -> ur.getRole().getRole()).toList()
                ))
                .toList();
    }

    //gán role cho user
    @Transactional
    public void assignRole(String email, String roleName){
        User user = userRepository.findByEmailWithRoles(email)
                .orElseThrow( ()-> new RuntimeException("User not found"));

        Role role = roleRepository.findByRole(roleName)
                .orElseThrow( ()-> new RuntimeException("Role not found"));

        //kiểm tra user đã ở role này chưa
        boolean alreadyHas = user.getRoles().stream()
                .anyMatch( ur -> ur.getRole().getRole().equals(roleName));
        if(alreadyHas){
            throw new RuntimeException("User already has this role");

        }

        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(role);
        user.getRoles().add(userRole);

        userRepository.save(user);
    }

    //gỡ role khỏi user
    public void removeRole(String email, String roleName){
        User user = userRepository.findByEmailWithRoles(email)
                .orElseThrow(()-> new RuntimeException("User not found"));
        user.getRoles().removeIf(ur -> ur.getRole().getRole().equals(roleName));
        userRepository.save(user);
    }
    //tạo role mới
    public void createRole(String roleName){
        if(roleRepository.existsByRole(roleName)){
            throw new RuntimeException("Role already exists");
        }
        Role role = new Role();
        role.setRole(roleName);
        roleRepository.save(role);
    }

    //Khóa ?? mở user
    @Transactional
    public void toggleUserEnable(String email){
        User user = userRepository.findByEmail(email)
                .orElseThrow( ()-> new RuntimeException("User not found"));
        user.setEnable(!user.isEnable());
        userRepository.save(user);
    }

    // lấy danh sách shop
    public List<ShopResponse> getAllShops(){
        return shopRepository.findALlWithOwner()
                .stream()
                .map(shop -> new ShopResponse(
                        shop.getId(),
                        shop.getName(),
                        shop.getDescription(),
                        shop.getAddress(),
                        shop.getPhone(),
                        shop.getAvatar(),
                        shop.isActive(),
                        shop.getOwner().getEmail()
                )).toList();
    }
    // mở khóa shop
    @Transactional
    public void toggleShopEnable(String email){
        Shop shop = shopRepository.findByOwner_Email(email)
                .orElseThrow(()-> new RuntimeException("Shop not found"));
        shop.setActive(!shop.isActive());
        shopRepository.save(shop);
    }
}
