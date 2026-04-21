package com.example.demo.auth.service;


import com.example.demo.auth.dto.RegisterUserRequest;
import com.example.demo.role.entity.Role;
import com.example.demo.role.repository.RoleRepository;

import com.example.demo.shop.repository.ShopRepository;
import com.example.demo.user.entity.User;
import com.example.demo.user.entity.UserRole;
import com.example.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepositor;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final ShopRepository shopRepository;

    @Transactional
    public void registerUser(RegisterUserRequest request){
        register(request, "ROLE_USER");
    }



    private void register(RegisterUserRequest request, String roleName){

        if(userRepositor.existsByEmail(request.getEmail())){
            throw new RuntimeException("Email already exists");
        }

        Role role = roleRepository.findByRole(roleName)
                .orElseThrow(()-> new RuntimeException("Role not found"));

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEnable(true);

        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(role);
        user.setRoles(new ArrayList<>(List.of(userRole)));
        userRepositor.save(user);
    }
}
