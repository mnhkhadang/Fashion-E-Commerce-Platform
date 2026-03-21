package com.example.demo.config;

import com.example.demo.role.entity.Role;
import com.example.demo.role.repository.RoleRepository;
import com.example.demo.user.entity.User;
import com.example.demo.user.entity.UserRole;
import com.example.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args){

        //tạo các role mặc định
        createRoleIfNotExists("ROLE_ADMIN");
        createRoleIfNotExists("ROLE_SHOP");
        createRoleIfNotExists("ROLE_USER");

        // =========================
        // 2️⃣ Tạo admin user nếu chưa có
        // =========================

        Role adminRole = roleRepository.findByRole("ROLE_ADMIN").get();
        if(userRepository.findByEmail("admin@gmail.com").isEmpty()){
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@gmail.com");
            admin.setPassword(passwordEncoder.encode("123456"));
            admin.setEnable(true);

            UserRole userRole = new UserRole();
            userRole.setUser(admin);
            userRole.setRole(adminRole);

            List<UserRole> roles = new ArrayList<>();
            roles.add(userRole);

            admin.setRoles(roles);
            userRepository.save(admin);

            System.out.println("🔥 Admin account created!");
        }


    }

    private void createRoleIfNotExists(String roleName) {
        if (!roleRepository.existsByRole(roleName)) {
            Role role = new Role();
            role.setRole(roleName);
            roleRepository.save(role);
            System.out.println("✅ Role created: " + roleName);
        }
    }


}
