package com.hotel.repository;

import com.hotel.model.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventTypeRepository extends JpaRepository<EventType, Long> {
    boolean existsByName(String name);
    List<EventType> findByIsAvailableTrue();
}

