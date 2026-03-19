package com.example.demo.payment.controller;

import com.example.demo.config.VNPayConfig;
import com.example.demo.payment.dto.CheckoutRequest;
import com.example.demo.payment.dto.CheckoutResponse;
import com.example.demo.payment.dto.PaymentResponse;
import com.example.demo.payment.entity.Payment;
import com.example.demo.payment.repository.PaymentRepository;
import com.example.demo.payment.service.PaymentService;
import com.example.demo.payment.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final VNPayService vnPayService;
    private final PaymentRepository paymentRepository;
    private final VNPayConfig vnPayConfig;

    //checkout
    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> checkout(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CheckoutRequest request,
            HttpServletRequest httpServletRequest
    ){
        CheckoutResponse response = paymentService.checkout(
                userDetails.getUsername(), request
        );

        // Nếu VNPay: tạo URL thật thay placeholder
        if(response.getVnpayUrl() != null &&
            response.getVnpayUrl().equals("VNPAY_URL_PLACEHOLDER")){
            Payment payment = paymentRepository.findByPaymentCode(response.getPaymentResponse().getPaymentCode())
                    .orElseThrow(()-> new RuntimeException("Payment not found"));

            String realUrl = vnPayService.createPaymentUrl(payment, getClientIp(httpServletRequest));

            return ResponseEntity.ok(new CheckoutResponse(
                    response.getPaymentResponse(),
                    response.getReservationExpiredAt(),
                    realUrl
            ));
        }

        return ResponseEntity.ok(response);
    }
    /**
     * GET /api/payments/vnpay-callback
     *
     * VNPay gọi về sau khi user thanh toán — không cần authentication.
     * Verify hash → confirm/fail → redirect 302 về frontend.
     *
     * Frontend nhận:
     * - /payment/result?status=success&code=PAY-xxx
     * - /payment/result?status=failed&code=PAY-xxx
     * - /payment/result?status=invalid
     */
    @GetMapping("/vnpay-callback")
    public void vnpayCallback(
            @RequestParam Map<String, String> params,
            HttpServletResponse httpServletResponse
            ) throws IOException {
        String paymentCode = params.get("vnp_TxnRef");
        log.info("VNPay callback: paymentCode={} responseCode={}",
                paymentCode, params.get("vnp_ResponseCode"));

        // Verify chữ ký — nếu sai có thể bị giả mạo
        if (!vnPayService.verifyCallback(params)) {
            log.warn("VNPay callback invalid signature: paymentCode={}", paymentCode);
            httpServletResponse.sendRedirect(
                    vnPayConfig.getFrontendUrl() + "/payment/result?status=invalid");
            return;
        }

        if (paymentCode == null || paymentCode.isBlank()) {
            httpServletResponse.sendRedirect(
                    vnPayConfig.getFrontendUrl() + "/payment/result?status=invalid");
            return;
        }

        if (vnPayService.isPaymentSuccess(params)) {
            paymentService.confirmVnpayPayment(paymentCode);
            httpServletResponse.sendRedirect(
                    vnPayConfig.getFrontendUrl()
                            + "/payment/result?status=success&code=" + paymentCode);
        } else {
            paymentService.failVNPayPayment(paymentCode);
            httpServletResponse.sendRedirect(
                    vnPayConfig.getFrontendUrl()
                            + "/payment/result?status=failed&code=" + paymentCode);
        }
    }

    // User xem danh sách payment
    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getMyPayments(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
                paymentService.getMyPayments(userDetails.getUsername()));
    }

    // User xem chi tiết payment
    @GetMapping("/{paymentCode}")
    public ResponseEntity<PaymentResponse> getByPaymentCode(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String paymentCode
    ) {
        return ResponseEntity.ok(
                paymentService.getByPaymentCode(
                        userDetails.getUsername(), paymentCode));
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
