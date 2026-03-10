package com.hotel.repository;

import com.hotel.model.DiningReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiningReservationRepository extends JpaRepository<DiningReservation, Long> {
    List<DiningReservation> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<DiningReservation> findByUserIdOrGuestEmailOrderByCreatedAtDesc(Long userId, String guestEmail);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(r) FROM DiningReservation r WHERE r.reservationDate = :date AND r.reservationTime = :time AND r.status IN ('confirmed', 'approved')")
    long countOverlappingConfirmedReservations(java.time.LocalDate date, java.time.LocalTime time);

    @org.springframework.data.jpa.repository.Query("SELECT r.tableId FROM DiningReservation r WHERE r.reservationDate = :date AND r.status IN ('confirmed', 'approved') AND r.tableId IS NOT NULL AND r.reservationTime > :startTime AND r.reservationTime < :endTime")
    java.util.List<Long> findBusyTableIds(java.time.LocalDate date, java.time.LocalTime startTime,
            java.time.LocalTime endTime);
}
