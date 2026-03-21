package com.example.demo.auth.repository;

import com.example.demo.auth.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long > {

    Optional<PasswordResetToken> findByToken(String token);
    void deleteByEmail(String email);
}
