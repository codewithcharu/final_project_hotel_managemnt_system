package com.hotel.repository;

import com.hotel.model.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Long> {
    boolean existsByName(String name);

    java.util.Optional<RoomType> findByName(String name);

    List<RoomType> findByIsAvailableTrue();
}
