package com.example.demo.payment.service;

import com.example.demo.config.VNPayConfig;
import com.example.demo.payment.entity.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;

import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;
import java.util.TreeMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class VNPayService {

    private final VNPayConfig vnPayConfig;

    /**
     * Tạo URL redirect sang trang thanh toán VNPay.
     *
     * Các params bắt buộc theo VNPay API v2.1.0:
     * - vnp_Version, vnp_Command, vnp_TmnCode
     * - vnp_Amount (số tiền × 100, không có dấu thập phân)
     * - vnp_CurrCode, vnp_TxnRef (paymentCode), vnp_OrderInfo
     * - vnp_OrderType, vnp_Locale, vnp_ReturnUrl
     * - vnp_IpAddr, vnp_CreateDate
     * - vnp_SecureHash (HMAC-SHA512 của tất cả params trên)
     */
    public String createPaymentUrl (Payment payment, String ipAddress){
        // VNPay yêu cầu amount × 100 (đơn vị: đồng, không có phần thập phân)
        long amount = payment.getTotalAmount()
                .multiply(java.math.BigDecimal.valueOf(100))
                .longValue();
        String createDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        // Dùng TreeMap để params tự động sort theo alphabet
        // VNPay yêu cầu params phải sort trước khi hash

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version",     vnPayConfig.getVersion());
        params.put("vnp_Command",     vnPayConfig.getCommand());
        params.put("vnp_TmnCode",     vnPayConfig.getTmnCode());
        params.put("vnp_Amount",      String.valueOf(amount));
        params.put("vnp_CurrCode",    vnPayConfig.getCurrencyCode());
        params.put("vnp_TxnRef",      payment.getPaymentCode());  // map paymentCode
        params.put("vnp_OrderInfo",   "Thanh toan " + payment.getPaymentCode());
        params.put("vnp_OrderType",   "other");
        params.put("vnp_Locale",      vnPayConfig.getLocale());
        params.put("vnp_ReturnUrl",   vnPayConfig.getReturnUrl());
        params.put("vnp_IpAddr",      ipAddress);
        params.put("vnp_CreateDate",  createDate);
        // Build query string và hash
        String queryString = buildQueryString(params);
        String secureHash = hmacSHA512(vnPayConfig.getHashSecret(), queryString);

        String paymentUrl = vnPayConfig.getPaymentUrl()
                + "?" + queryString
                + "&vnp_SecureHash=" + secureHash;
        log.info("Created VNPay URL for payment={}", payment.getPaymentCode());

        return paymentUrl;

    }

    /**
     * Verify chữ ký từ VNPay callback.
     *
     * VNPay gửi lại tất cả params + vnp_SecureHash.
     * Ta bỏ vnp_SecureHash ra, hash lại các params còn lại,
     * so sánh với vnp_SecureHash nhận được.
     *
     * Trả về true nếu hash khớp → callback hợp lệ từ VNPay.
     */

    public boolean verifyCallback(Map<String, String> params){
        String receivedHash = params.get("vnp_SecureHash");
        if(receivedHash == null || receivedHash.isBlank()){
            log.warn("VNPay callback missing vnp_SecureHash");
            return false;
        }
        // Bỏ hash fields ra trước khi tính lại
        Map<String, String> paramsToVerify = new TreeMap<>(params);
        paramsToVerify.remove("vnp_SecureHash");
        paramsToVerify.remove("vnp_SecureHashType");

        String queryString = buildQueryString(paramsToVerify);
        String expectedHash = hmacSHA512(vnPayConfig.getHashSecret(), queryString);

        boolean valid = expectedHash.equalsIgnoreCase(receivedHash);
        if (!valid) {
            log.warn("VNPay callback hash mismatch. Expected={} Received={}",
                    expectedHash, receivedHash);
        }
        return valid;
    }
    /**
     * Kiểm tra response code từ VNPay.
     * "00" = thành công, các code khác = thất bại.
     */

    public boolean isPaymentSuccess(Map<String , String > params){
        return "00".equals(params.get("vnp_ResponseCode"));
    }
    // ─── Private helpers
    /**
     * Build query string từ params đã sort.
     * URL encode từng value theo chuẩn VNPay.
     */
    private String buildQueryString(Map<String, String > params){
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()){
            if (sb.length() > 0)
                sb.append("&");
            sb.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII));
            sb.append("=");
            sb.append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
        }

        return sb.toString();
    }
    /**
     * HMAC-SHA512 theo chuẩn VNPay.
     */
    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(
                    key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute HMAC-SHA512", e);
        }
    }


}
