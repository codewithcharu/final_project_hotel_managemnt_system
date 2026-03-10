package com.hotel.repository;

import com.hotel.model.EventPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventPlanRepository extends JpaRepository<EventPlan, Long> {
    List<EventPlan> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<EventPlan> findByUserIdOrGuestEmailOrderByCreatedAtDesc(Long userId, String guestEmail);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(e) FROM EventPlan e WHERE e.eventDate = :date AND e.venue = :venue AND e.status IN ('approved', 'pending')")
    long countOverlappingEvents(java.time.LocalDate date, String venue);
}
