package com.example.demo.returnrequest.entity;

public enum ReturnRequestStatus {
    REQUESTED,        // user vừa tạo yêu cầu
    APPROVED,         // shop đã approve → đang chờ user gửi hàng
    RETURNING,        // user đã gửi hàng, shop chờ nhận
    RETURNED,         // shop đã nhận hàng → hoàn stock + giảm sold
    REJECTED          // shop từ chối
}
