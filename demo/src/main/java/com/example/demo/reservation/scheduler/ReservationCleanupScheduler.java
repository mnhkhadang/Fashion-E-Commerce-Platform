package com.example.demo.reservation.scheduler;

import com.example.demo.product.entity.Product;
import com.example.demo.product.repository.ProductRepository;
import com.example.demo.reservation.entity.Reservation;
import com.example.demo.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReservationCleanupScheduler {

    private final ReservationRepository reservationRepository;
    private final ProductRepository productRepository;

    /**
     * Chạy mỗi 1 phút.
     * Tìm tất cả reservation ACTIVE đã hết TTL → release stock → đánh dấu RELEASED.
     *
     * Dùng bulk approach để giảm số lần query DB:
     * - Gom nhóm theo product_id
     * - Update reservedStock mỗi product một lần
     * - Bulk update status
     */
    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void cleanupExipredReservations(){
        List<Reservation> expired = reservationRepository.findExpiredReservations(LocalDateTime.now());
        if (expired.isEmpty()){
            return;
        }

        log.info("Cleanup: found {} expired reservations ", expired.size());
        // Gom nhóm theo product để update reservedStock gộp
        // Tránh N+1 update mỗi reservation một lần
        Map<Product, Integer> stockToRelease = expired.stream()
                .collect(Collectors.groupingBy(
                        Reservation::getProduct,
                        Collectors.summingInt(Reservation::getQuantity)
                ));
        for( Map.Entry<Product, Integer> entry : stockToRelease.entrySet()){
            Product product = entry.getKey();
            int releaseQty = entry.getValue();

            // Load lại product với lock để đảm bảo consistency
            productRepository.findByIdWithLock(product.getId()).ifPresent(p -> {
                int newReservedStock = Math.max(0, p.getReservedStock() - releaseQty);
                p.setReservedStock(newReservedStock);
                productRepository.save(p);
                log.info("Released {} reserved stock for product = {} ", releaseQty, p.getName());
            });
        }
        // Bulk update tất cả reservation hết hạn → RELEASED
        List<Long> expiredIds = expired.stream()
                .map(Reservation::getId)
                .toList();
        reservationRepository.bulkRelease(expiredIds);
        log.info("Cleanup: released {} expired reservations ", expired.size());
    }
}
