package com.hotel.controller;

import com.hotel.model.DiningReservation;
import com.hotel.repository.DiningReservationRepository;
import com.hotel.repository.UserRepository;
import com.hotel.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dining-reservations")
@CrossOrigin(origins = "*")
public class DiningReservationController {

        @Autowired
        private DiningReservationRepository reservationRepository;

        @Autowired
        private com.hotel.repository.DiningTypeRepository diningTypeRepository;

        @Autowired
        private com.hotel.repository.DiningTableRepository diningTableRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private JwtUtil jwtUtil;

        @Autowired
        private com.hotel.service.EmailService emailService;

        @GetMapping
        public ResponseEntity<Map<String, Object>> getAllReservations() {
                List<DiningReservation> reservations = reservationRepository.findAll();
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", reservations);
                return ResponseEntity.ok(response);
        }

        @PostMapping
        public ResponseEntity<Map<String, Object>> createReservation(
                        @RequestBody Map<String, Object> request,
                        HttpServletRequest httpRequest) {

                DiningReservation reservation = new DiningReservation();
                reservation.setOccasion((String) request.getOrDefault("occasion", null));
                reservation.setReservationDate(LocalDate.parse((String) request.get("reservationDate")));
                reservation.setReservationTime(LocalTime.parse((String) request.get("reservationTime")));
                reservation.setGuestCount(((Number) request.get("guestCount")).intValue());
                reservation.setGuestName((String) request.get("guestName"));
                reservation.setGuestEmail((String) request.get("guestEmail"));
                reservation.setGuestPhone((String) request.getOrDefault("guestPhone", null));
                reservation.setSpecialRequests((String) request.getOrDefault("specialRequests", null));
                reservation.setTotalPrice(
                                request.containsKey("totalPrice") ? ((Number) request.get("totalPrice")).doubleValue()
                                                : 0.0);
                reservation.setStatus(DiningReservation.Status.confirmed);
                reservation.setOrderStatus(DiningReservation.OrderStatus.pending);

                // Availability check
                if (request.containsKey("diningTypeId")) {
                        Long typeId = ((Number) request.get("diningTypeId")).longValue();
                        com.hotel.model.DiningType type = diningTypeRepository.findById(typeId)
                                        .orElseThrow(() -> new RuntimeException("Dining type not found"));

                        // Handle Table Assignment
                        if (request.containsKey("tableId") && request.get("tableId") != null) {
                                // Manual selection
                                Long tableId = ((Number) request.get("tableId")).longValue();
                                reservation.setTableId(tableId);

                                com.hotel.model.DiningTable table = diningTableRepository.findById(tableId)
                                                .orElseThrow(() -> new RuntimeException("Table not found"));

                                // Verify table availability
                                LocalTime startTime = reservation.getReservationTime().minusHours(2);
                                LocalTime endTime = reservation.getReservationTime().plusHours(2);
                                List<Long> busyTableIds = reservationRepository
                                                .findBusyTableIds(reservation.getReservationDate(), startTime, endTime);

                                if (busyTableIds.contains(tableId)) {
                                        Map<String, Object> errorResponse = new HashMap<>();
                                        errorResponse.put("success", false);
                                        errorResponse.put("message",
                                                        "Selected table is already booked for this time. Please choose another table.");
                                        return ResponseEntity.status(400).body(errorResponse);
                                }

                                reservation.setTableNumber(table.getTableNumber());
                        } else {
                                // Auto-assignment
                                // Find all tables with capacity >= guestCount, ordered by capacity ASC
                                List<com.hotel.model.DiningTable> candidateTables = diningTableRepository
                                                .findAvailableTablesByMinCapacity(reservation.getGuestCount());

                                // Check availability
                                LocalTime startTime = reservation.getReservationTime().minusHours(2);
                                LocalTime endTime = reservation.getReservationTime().plusHours(2);
                                List<Long> busyTableIds = reservationRepository
                                                .findBusyTableIds(reservation.getReservationDate(), startTime, endTime);

                                // Find first available table (smallest sufficient capacity)
                                com.hotel.model.DiningTable assignedTable = candidateTables.stream()
                                                .filter(table -> !busyTableIds.contains(table.getId()))
                                                .findFirst()
                                                .orElse(null);

                                if (assignedTable == null) {
                                        Map<String, Object> errorResponse = new HashMap<>();
                                        errorResponse.put("success", false);
                                        errorResponse.put("message",
                                                        "No tables available for the selected date and time.");
                                        return ResponseEntity.status(400).body(errorResponse);
                                }

                                reservation.setTableId(assignedTable.getId());
                                reservation.setTableNumber(assignedTable.getTableNumber());
                        }

                        long existingCount = reservationRepository.countOverlappingConfirmedReservations(
                                        reservation.getReservationDate(),
                                        reservation.getReservationTime());

                        int maxReservations = (type.getMaxConcurrentReservations() != null
                                        && type.getMaxConcurrentReservations() > 0)
                                                        ? type.getMaxConcurrentReservations()
                                                        : 10;

                        if (existingCount >= maxReservations) {
                                Map<String, Object> errorResponse = new HashMap<>();
                                errorResponse.put("success", false);
                                errorResponse.put("message",
                                                "We are fully booked for this time slot. Please choose another time.");
                                return ResponseEntity.status(400).body(errorResponse);
                        }
                }

                // Get user ID if authenticated
                String authHeader = httpRequest.getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        try {
                                Long userId = jwtUtil.getUserIdFromToken(token);
                                reservation.setUserId(userId);
                        } catch (Exception e) {
                                // User not authenticated, continue without userId
                        }
                }

                reservationRepository.save(reservation);

                // Send email notification
                try {
                        String details = String.format(
                                        "Occasion: %s%nDate: %s%nTime: %s%nGuests: %d%nName: %s%nTotal: Rs. %.2f",
                                        reservation.getOccasion() != null ? reservation.getOccasion() : "Dining",
                                        reservation.getReservationDate(),
                                        reservation.getReservationTime(),
                                        reservation.getGuestCount(),
                                        reservation.getGuestName(),
                                        reservation.getTotalPrice() != null ? reservation.getTotalPrice() : 0.0);

                        emailService.sendReservationApprovedEmail(
                                        reservation.getGuestEmail(),
                                        reservation.getGuestName(),
                                        "Dining",
                                        details);
                } catch (Exception e) {
                        System.err.println("Failed to send dining reservation receipt email: " + e.getMessage());
                }

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Dining reservation confirmed successfully!");
                Map<String, Object> data = new HashMap<>();
                data.put("id", reservation.getId());
                data.put("occasion", reservation.getOccasion());
                data.put("reservationDate", reservation.getReservationDate());
                data.put("reservationTime", reservation.getReservationTime());
                data.put("guestCount", reservation.getGuestCount());
                data.put("status", reservation.getStatus().name());
                response.put("data", data);

                return ResponseEntity.ok(response);
        }

        @GetMapping("/my-reservations")
        public ResponseEntity<Map<String, Object>> getMyReservations(Authentication authentication) {
                String email = authentication.getName();
                Long userId = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"))
                                .getId();

                List<DiningReservation> reservations = reservationRepository
                                .findByUserIdOrGuestEmailOrderByCreatedAtDesc(userId, email);

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", reservations);

                return ResponseEntity.ok(response);
        }

        @GetMapping("/available-tables")
        public ResponseEntity<Map<String, Object>> getAvailableTables(
                        @RequestParam String date,
                        @RequestParam String time,
                        @RequestParam Integer guests) {

                LocalDate reservationDate = LocalDate.parse(date);
                LocalTime reservationTime = LocalTime.parse(time);

                // Define busy window (e.g. 2 hours before and after)
                LocalTime startTime = reservationTime.minusHours(2);
                LocalTime endTime = reservationTime.plusHours(2);

                // Get IDs of tables that are busy
                List<Long> busyTableIds = reservationRepository.findBusyTableIds(reservationDate, startTime, endTime);

                // Get all tables with sufficient capacity
                List<com.hotel.model.DiningTable> candidateTables = diningTableRepository
                                .findAvailableTablesByMinCapacity(guests);

                // Filter out busy tables
                List<com.hotel.model.DiningTable> availableTables = candidateTables.stream()
                                .filter(table -> !busyTableIds.contains(table.getId()))
                                .toList();

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", availableTables);

                return ResponseEntity.ok(response);
        }
}
