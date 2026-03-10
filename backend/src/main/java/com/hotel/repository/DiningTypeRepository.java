package com.hotel.repository;

import com.hotel.model.DiningType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiningTypeRepository extends JpaRepository<DiningType, Long> {
    boolean existsByName(String name);

    java.util.List<DiningType> findByIsAvailableTrue();
}
