package com.hotel.repository;

import com.hotel.model.DiningTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiningTableRepository extends JpaRepository<DiningTable, Long> {
    Optional<DiningTable> findByTableNumber(String tableNumber);

    List<DiningTable> findByIsAvailableTrue();

    @Query("SELECT t FROM DiningTable t WHERE t.capacity >= :minCapacity AND t.isAvailable = true ORDER BY t.capacity ASC")
    List<DiningTable> findAvailableTablesByMinCapacity(Integer minCapacity);
}
