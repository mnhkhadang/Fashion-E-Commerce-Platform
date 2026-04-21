package com.example.demo.role.service;

import com.example.demo.role.entity.Role;
import com.example.demo.role.repository.RoleRepository;
import org.springframework.stereotype.Service;

@Service
public class RoleService {
    private final RoleRepository roleRepository;
    public RoleService(RoleRepository roleRepository){
        this.roleRepository = roleRepository;
    }
    public Role getByName(String role){
        return roleRepository.findByRole(role).orElseThrow(() -> new RuntimeException("Role not found"));
    }
}
