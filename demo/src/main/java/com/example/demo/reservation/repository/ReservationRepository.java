package com.example.demo.reservation.repository;

import com.example.demo.reservation.entity.Reservation;
import com.example.demo.reservation.entity.Reservation.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // tìm reservation ACTIVE của user cho product cụ thể
    // dùng khi checkout để kiểm tra user đã reserve chưa
    Optional<Reservation> findByUserIdAndProductIdAndStatus(
            UUID userId, UUID productId, ReservationStatus status);

    // tìm tất cả reservation ACTIVE của user (dùng khi user xem checkout summary)
    List<Reservation> findByUserIdAndStatus(UUID userId, ReservationStatus status);

    // tìm tất cả reservation hết hạn cần cleanup
    // scheduler gọi mỗi phút
    @Query("SELECT r FROM Reservation r WHERE r.status = 'ACTIVE' AND r.expiresAt < :now")
    List<Reservation> findExpiredReservations(@Param("now") LocalDateTime now);

    // tìm tất cả reservation ACTIVE của một payment (khi cancel payment)
    @Query("SELECT r FROM Reservation r WHERE r.orderId IN :orderIds AND r.status = 'ACTIVE'")
    List<Reservation> findActiveByOrderIds(@Param("orderIds") List<UUID> orderIds);

    // bulk update status hết hạn → RELEASED (dùng trong scheduler)
    @Modifying
    @Query("UPDATE Reservation r SET r.status = 'RELEASED' WHERE r.id IN :ids")
    void bulkRelease(@Param("ids") List<Long> ids);
}