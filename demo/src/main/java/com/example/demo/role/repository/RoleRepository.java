package com.example.demo.role.repository;

import com.example.demo.role.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    // Lấy Role theo tên role (VD: ROLE_ADMIN, ROLE_USER)
    // Trả về Optional để bắt buộc xử lý trường hợp role không tồn tại
    // Thường dùng khi:
    // - Gán role cho user
    // - Load role trong quá trình login / phân quyền
    Optional<Role> findByRole(String role);

    // Kiểm tra role đã tồn tại hay chưa theo tên
    // Dùng khi tạo mới role để tránh trùng dữ liệu
    // Nhẹ hơn findByRole vì chỉ trả về true / false
    boolean existsByRole(String role);
}
