package com.example.demo.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    private static final String FROM = "noreply@shopvn.com";
    private static final String APP_NAME = "ShopVN";

    // ─── Auth ────────────────────────────────────────────────────────────────
    @Async
    public void sendPasswordResetEmail(String toEmail, String resetLink){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@shopvn.com");
        message.setTo(toEmail);
        message.setSubject("[ShopVN] Đặt lại mật khẩu");
        message.setText(
                "Xin chào,\n\n" +
                        "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n\n" +
                        "Click vào link dưới đây để đặt lại mật khẩu (có hiệu lực trong 15 phút):\n\n" +
                        resetLink + "\n\n" +
                        "Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.\n\n" +
                        "Trân trọng,\nShopVN"
        );
        mailSender.send(message);
    }

    // ─── Checkout ────────────────────────────────────────────────────────────

    /**
     * Gửi email xác nhận checkout thành công cho user.
     * Gọi từ PaymentService.checkout() sau khi save payment.
     */
    @Async
    public void sendCheckoutSuccessEmail(String toEmail, String paymentCode, String totalAmount, String method){
        send(toEmail,
                "[" + APP_NAME + "] Đặt hàng thành công - " + paymentCode,
                "Xin chào,\n\n" +
                        "Đơn hàng của bạn đã được đặt thành công!\n\n" +
                        "Mã thanh toán: " + paymentCode + "\n" +
                        "Tổng tiền: " + totalAmount + " VNĐ\n" +
                        "Phương thức: " + method + "\n\n" +
                        (method.equals("COD")
                                ? "Đơn hàng đã được xác nhận. Shop sẽ chuẩn bị và giao hàng sớm nhất.\n\n"
                                : "Vui lòng hoàn tất thanh toán VNPay trong 15 phút.\n\n") +
                        "Trân trọng,\n" + APP_NAME
        );
    }

    /**
     * Thông báo cho shop khi có đơn hàng mới.
     * Gọi từ PaymentService.checkout() cho từng shop trong order.
     */
    @Async
    public void sendNewOrderNotificationToShop(String shopEmail, String orderCode, String totalAmount){
        send(shopEmail,
                "[" + APP_NAME + "] Bạn có đơn hàng mới - " + orderCode,
                "Xin chào,\n\n" +
                        "Shop của bạn vừa nhận được đơn hàng mới!\n\n" +
                        "Mã đơn hàng: " + orderCode + "\n" +
                        "Tổng tiền: " + totalAmount + " VNĐ\n\n" +
                        "Vui lòng chuẩn bị hàng và cập nhật trạng thái đơn hàng.\n\n" +
                        "Trân trọng,\n" + APP_NAME
        );
    }
    // ─── Order status ────────────────────────────────────────────────────────

    /**
     * Thông báo cho user khi order thay đổi trạng thái.
     * Gọi từ OrderService.updateStatus().
     */
    @Async
    public void sendOrderStatusUpdateEmail(String toEmail, String orderCode, String newStatus){
        String statusText = switch (newStatus) {
            case "CONFIRMED"        -> "Đã xác nhận — shop đang chuẩn bị hàng";
            case "SHIPPING"         -> "Đang giao hàng";
            case "DELIVERED"        -> "Đã giao hàng thành công";
            case "CANCELLED"        -> "Đã hủy";
            case "RETURN_REQUESTED" -> "Yêu cầu trả hàng đang được xử lý";
            case "RETURNING"        -> "Shop đã chấp nhận — vui lòng gửi hàng về";
            case "RETURNED"         -> "Trả hàng thành công";
            default -> newStatus;
        };

        send(toEmail,
                "[" + APP_NAME + "] Cập nhật đơn hàng " + orderCode,
                "Xin chào,\n\n" +
                        "Đơn hàng " + orderCode + " của bạn đã được cập nhật:\n\n" +
                        "Trạng thái: " + statusText + "\n\n" +
                        "Trân trọng,\n" + APP_NAME
        );
    }

    // ─── Return/Refund ───────────────────────────────────────────────────────

    /**
     * Thông báo cho shop khi có return request mới.
     * Gọi từ ReturnService.requestReturn().
     */
    @Async
    public void sendReturnRequestToShop(String shopEmail, String orderCode, String reason){
        send(shopEmail,
                "[" + APP_NAME + "] Yêu cầu trả hàng - " + orderCode,
                "Xin chào,\n\n" +
                        "Khách hàng đã gửi yêu cầu trả hàng cho đơn " + orderCode + ".\n\n" +
                        "Lý do: " + reason + "\n\n" +
                        "Vui lòng xem xét và phản hồi yêu cầu này.\n\n" +
                        "Trân trọng,\n" + APP_NAME
        );
    }
    /**
     * Thông báo kết quả return request cho user (approved hoặc rejected).
     * Gọi từ ReturnService.approveReturn() và rejectReturn().
     */
    @Async
    public void sendReturnResultToUser(String toEmail, String orderCode, boolean approved, String rejectReason){
        if (approved) {
            send(toEmail,
                    "[" + APP_NAME + "] Yêu cầu trả hàng được chấp nhận - " + orderCode,
                    "Xin chào,\n\n" +
                            "Yêu cầu trả hàng cho đơn " + orderCode + " đã được chấp nhận!\n\n" +
                            "Vui lòng gửi hàng về địa chỉ shop trong thời gian sớm nhất.\n\n" +
                            "Trân trọng,\n" + APP_NAME
            );
        } else {
            send(toEmail,
                    "[" + APP_NAME + "] Yêu cầu trả hàng bị từ chối - " + orderCode,
                    "Xin chào,\n\n" +
                            "Yêu cầu trả hàng cho đơn " + orderCode + " đã bị từ chối.\n\n" +
                            "Lý do: " + rejectReason + "\n\n" +
                            "Nếu có thắc mắc, vui lòng liên hệ shop trực tiếp.\n\n" +
                            "Trân trọng,\n" + APP_NAME
            );
        }
    }


    // ─── Private helper
    private void send(String to, String subject, String text){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(FROM);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }
}
