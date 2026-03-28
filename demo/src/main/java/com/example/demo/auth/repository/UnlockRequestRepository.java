package com.example.demo.auth.repository;

import com.example.demo.auth.entity.UnlockRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UnlockRequestRepository extends JpaRepository<UnlockRequest, Long> {

    List<UnlockRequest> findByStatus(UnlockRequest.UnlockRequestStatus status);

    boolean existsByEmailAndStatus(String email, UnlockRequest.UnlockRequestStatus status);
}
