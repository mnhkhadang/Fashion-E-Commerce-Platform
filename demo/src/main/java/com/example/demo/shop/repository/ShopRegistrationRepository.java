package com.example.demo.shop.repository;

import com.example.demo.shop.entity.ShopRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ShopRegistrationRepository extends JpaRepository<ShopRegistration, UUID> {

    List<ShopRegistration> findAllByOrderByCreatedAtDesc();
    Optional<ShopRegistration> findTopByUserEmailOrderByCreatedAtDesc(String email);
    boolean existsByUserEmailAndStatus(String email, ShopRegistration.RegistrationStatus status);
}
