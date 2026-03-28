package com.example.demo.auth.service;

import com.example.demo.auth.entity.UnlockRequest;
import com.example.demo.auth.repository.UnlockRequestRepository;
import com.example.demo.common.exception.ConflictException;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import com.example.demo.common.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor

public class UnlockRequestService {
    private final UnlockRequestRepository unlockRequestRepository;
    private final UserRepository userRepository;

    //User gửi y/c mở khóa
    @Transactional
    public void createRequest(String email, String reason){
        // kiểm tra email tồn tại
        User user = userRepository.findByEmail(email)
                .orElseThrow(()-> new NotFoundException("Email không tồn tại"));
        //tránh spam - mỗi email chỉ có 1 request PENDING
        if (unlockRequestRepository.existsByEmailAndStatus(
                email, UnlockRequest.UnlockRequestStatus.PENDING)){
            throw new ConflictException("Bạn đã có yêu cầu. Đang chờ xử lí");
        }

        UnlockRequest request = new UnlockRequest();
        request.setEmail(email);
        request.setReason(reason);
        unlockRequestRepository.save(request);
    }

    // Admin lấy danh sách PENDING
    public List<UnlockRequest> getPendingRequests() {
        return unlockRequestRepository.findByStatus(UnlockRequest.UnlockRequestStatus.PENDING);
    }

    // Admin approve → mở khóa user
    @Transactional
    public void approve (Long id){
        UnlockRequest request = unlockRequestRepository.findById(id)
                .orElseThrow( ()-> new NotFoundException("Request not found"));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new NotFoundException("User not found"));

        user.setEnable(true);
        userRepository.save(user);
        request.setStatus(UnlockRequest.UnlockRequestStatus.APPROVED);
        request.setReviewedAt(LocalDateTime.now());
        unlockRequestRepository.save(request);
    }

    //Admin reject
    @Transactional
    public void reject(long id) {
        UnlockRequest request = unlockRequestRepository.findById(id)
                .orElseThrow( ()-> new NotFoundException("Request not found"));

        request.setStatus(UnlockRequest.UnlockRequestStatus.REJECTED);
        request.setCreatedAt(LocalDateTime.now());
        unlockRequestRepository.save(request);
    }
}
