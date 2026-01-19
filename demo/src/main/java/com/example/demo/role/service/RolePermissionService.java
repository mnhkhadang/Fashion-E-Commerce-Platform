package com.example.demo.role.service;

import com.example.demo.role.entity.Permission;
import com.example.demo.role.entity.Role;
import com.example.demo.role.entity.RolePermission;
import com.example.demo.role.repository.RolePermissionRepository;
import com.example.demo.role.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RolePermissionService {
    private RolePermissionRepository rolePermissionRepository;

    /**
     * Gán permission cho role
     * - Tránh tạo trùng role_permission
     */
    public void assignPermissionToRole(Role role, Permission permission){
        if(rolePermissionRepository.existsByRoleAndPermission(role, permission)){
            return;
        }

        RolePermission rolePermission = new RolePermission();
        rolePermission.setRole(role);
        rolePermission.setPermission(permission);
        rolePermissionRepository.save(rolePermission);

    }
    /**
     * Gỡ permission khỏi role
     */
    public void removePermissionToRole(Role role, Permission permission){
        rolePermissionRepository.deleteByRoleAndPermission(role,permission);
    }
    /**
     * Lấy danh sách permission theo role
     */
    public List<Permission> getPermissionsByRole(Role role){
        return rolePermissionRepository.findByRole(role)
                        .stream()
                        .map(RolePermission::getPermission)
                        .toList();

    }

}
