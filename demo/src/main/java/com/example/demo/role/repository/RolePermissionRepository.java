package com.example.demo.role.repository;

import com.example.demo.role.entity.Permission;
import com.example.demo.role.entity.Role;
import com.example.demo.role.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {

    boolean existsByRoleAndPermission(Role role, Permission permission);
    void deleteByRoleAndPermission(Role role, Permission permission);
    List<RolePermission> findByRole(Role role);
    Optional<RolePermission> findByRoleAndPermission(Role role, Permission permission);
}
