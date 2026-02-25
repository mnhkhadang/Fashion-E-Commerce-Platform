package com.example.demo.shop.service;

import com.example.demo.shop.dto.ShopRequest;
import com.example.demo.shop.dto.ShopResponse;
import com.example.demo.shop.entity.Shop;
import com.example.demo.shop.repository.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopRepository shopRepository;

    // Cập nhật thông tin shop
    @Transactional
    public ShopResponse updateShop(String email, ShopRequest request) {
        Shop shop = shopRepository.findByOwner_Email(email)
                .orElseThrow(() -> new RuntimeException("Shop not found"));

        shop.setName(request.getName());
        shop.setDescription(request.getDescription());
        shop.setAddress(request.getAddress());
        shop.setPhone(request.getPhone());
        shop.setAvatar(request.getAvatar());

        return toResponse(shopRepository.save(shop));
    }

    // Xem thông tin shop của mình
    public ShopResponse getMyShop(String email) {
        Shop shop = shopRepository.findByOwner_Email(email)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        return toResponse(shop);
    }

    // Xem thông tin shop theo id (public)
    public ShopResponse getById(String name) {
        Shop shop = shopRepository.findByIdWithOwner(name)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        return toResponse(shop);
    }

    private ShopResponse toResponse(Shop shop) {
        return new ShopResponse(
                shop.getId(),
                shop.getName(),
                shop.getDescription(),
                shop.getAddress(),
                shop.getPhone(),
                shop.getAvatar(),
                shop.isActive(),
                shop.getOwner().getEmail()
        );
    }
}