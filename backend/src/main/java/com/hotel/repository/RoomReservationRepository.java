package com.hotel.repository;

import com.hotel.model.RoomReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomReservationRepository extends JpaRepository<RoomReservation, Long> {
        List<RoomReservation> findByUserIdOrderByCreatedAtDesc(Long userId);

        List<RoomReservation> findByUserIdOrGuestEmailOrderByCreatedAtDesc(Long userId, String guestEmail);

        @org.springframework.data.jpa.repository.Query("SELECT COUNT(r) FROM RoomReservation r WHERE r.roomType = :roomType AND r.status IN ('approved', 'checked_in') AND (r.checkOutDate > :checkIn AND r.checkInDate < :checkOut)")
        long countOverlappingApprovedReservations(String roomType, java.time.LocalDate checkIn,
                        java.time.LocalDate checkOut);
}
