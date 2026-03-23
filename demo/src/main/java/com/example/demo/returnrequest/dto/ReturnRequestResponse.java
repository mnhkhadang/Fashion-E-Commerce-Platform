package com.example.demo.returnrequest.dto;

import com.example.demo.returnrequest.entity.ReturnRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ReturnRequestResponse {

    private Long id;
    private String orderCode;
    private String reason;
    private ReturnRequestStatus status;
    private String rejectReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime reviewedAt;
    private String username;
}
