package com.example.demo.shop.service;


import com.example.demo.role.entity.Role;
import com.example.demo.role.repository.RoleRepository;
import com.example.demo.shop.dto.ShopRegistrationRequest;
import com.example.demo.shop.dto.ShopRegistrationResponse;
import com.example.demo.shop.entity.Shop;
import com.example.demo.shop.entity.ShopRegistration;
import com.example.demo.shop.repository.ShopRegistrationRepository;
import com.example.demo.shop.repository.ShopRepository;
import com.example.demo.user.entity.User;
import com.example.demo.user.entity.UserRole;
import com.example.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShopRegistrationService {

    private final ShopRegistrationRepository shopRegistrationRepository;
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final RoleRepository roleRepository;

    //user gửi đơn đăng kí shop
    @Transactional
    public ShopRegistrationResponse register(String email, ShopRegistrationRequest request){
        //kiểm tra đã có đơn PENDING chưa
        if (shopRegistrationRepository.existsByUserEmailAndStatus(email, ShopRegistration.RegistrationStatus.PENDING)) {
            throw new RuntimeException("You already have a pending registration");
        }
        // kiểm tra đã là shop chưa
        if(shopRepository.existsByOwner_Email(email)){
            throw new RuntimeException("You already have a shop");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow( ()-> new RuntimeException("User not found"));
        ShopRegistration shopRegistration = new ShopRegistration();
        shopRegistration.setShopName(request.getShopName());
        shopRegistration.setDescription(request.getDescription());
        shopRegistration.setAddress(request.getAddress());
        shopRegistration.setPhone(request.getPhone());
        shopRegistration.setAvatar(request.getAvatar());
        shopRegistration.setUser(user);

        return toResponse(shopRegistrationRepository.save(shopRegistration));
    }

    // user xem trạng thái đơn của mình
    @Transactional(readOnly = true)
    public ShopRegistrationResponse getMyRegistration(String email){
        return shopRegistrationRepository.findTopByUserEmailOrderByCreatedAtDesc(email)
                .map(this::toResponse)
                .orElseThrow( ()-> new RuntimeException("No registration found"));
    }

    //admin lấy danh sách tất cả đơn
    @Transactional(readOnly = true)
    public List<ShopRegistrationResponse> getAllRegistration(){
        return shopRegistrationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // admin duyệt đơn
    @Transactional
    public ShopRegistrationResponse approve(UUID id){
        ShopRegistration shopRegistration = shopRegistrationRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Registration not found"));

        if(shopRegistration.getStatus() != ShopRegistration.RegistrationStatus.PENDING){
            throw new RuntimeException("Registration already reviewd");
        }

        //tạo shop

        Shop shop = new Shop();
        shop.setName(shopRegistration.getShopName());
        shop.setDescription(shopRegistration.getDescription());
        shop.setAddress(shopRegistration.getAddress());
        shop.setPhone(shopRegistration.getPhone());
        shop.setAvatar(shopRegistration.getAvatar());
        shop.setOwner(shopRegistration.getUser());
        shopRepository.save(shop);

        //cấu role_shop
        User user = shopRegistration.getUser();
        Role role = roleRepository.findByRole("ROLE_SHOP")
                .orElseThrow(()-> new RuntimeException("Role not found"));

        boolean alreadyHas = user.getRoles().stream()
                .anyMatch(ur -> ur.getRole().getRole().equals("ROLE_SHOP"));
        if(!alreadyHas) {
            UserRole userRole= new UserRole();
            userRole.setUser(user);
            userRole.setRole(role);
            user.getRoles().add(userRole);
            userRepository.save(user);
        }

        shopRegistration.setStatus(ShopRegistration.RegistrationStatus.APPROVED);
        shopRegistration.setReviewedAt(LocalDateTime.now());
        return toResponse(shopRegistrationRepository.save(shopRegistration));
    }

    //Admin từ chối đơn
    @Transactional
    public ShopRegistrationResponse reject(UUID id, String reason){
        ShopRegistration shopRegistration = shopRegistrationRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Registration not found"));

        if(shopRegistration.getStatus() != ShopRegistration.RegistrationStatus.PENDING){
            throw new RuntimeException("Registration already reviewed");
        }

        shopRegistration.setStatus(ShopRegistration.RegistrationStatus.REJECTED);
        shopRegistration.setRejectReason(reason);
        shopRegistration.setReviewedAt(LocalDateTime.now());
        return  toResponse(shopRegistrationRepository.save(shopRegistration));

    }



    private ShopRegistrationResponse toResponse(ShopRegistration shopRegistration){
        return new ShopRegistrationResponse(
                shopRegistration.getId(),
                shopRegistration.getShopName(),
                shopRegistration.getDescription(),
                shopRegistration.getAddress(),
                shopRegistration.getPhone(),
                shopRegistration.getAvatar(),
                shopRegistration.getStatus(),
                shopRegistration.getRejectReason(),
                shopRegistration.getCreatedAt(),
                shopRegistration.getReviewedAt(),
                shopRegistration.getUser().getEmail(),
                shopRegistration.getUser().getUsername()
        );
    }
}
