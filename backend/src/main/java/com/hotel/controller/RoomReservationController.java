package com.hotel.controller;

import com.hotel.model.RoomReservation;
import com.hotel.repository.RoomReservationRepository;
import com.hotel.repository.UserRepository;
import com.hotel.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/room-reservations")
@CrossOrigin(origins = "*")
public class RoomReservationController {

    @Autowired
    private RoomReservationRepository reservationRepository;

    @Autowired
    private com.hotel.repository.RoomTypeRepository roomTypeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private com.hotel.service.EmailService emailService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllReservations() {
        List<RoomReservation> reservations = reservationRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", reservations);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createReservation(
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpRequest) {

        RoomReservation reservation = new RoomReservation();
        reservation.setRoomType((String) request.get("roomType"));
        String checkInStr = (String) request.get("checkIn");
        String checkOutStr = (String) request.get("checkOut");
        reservation.setCheckInDate(LocalDate.parse(checkInStr));
        reservation.setCheckOutDate(LocalDate.parse(checkOutStr));
        reservation.setGuestName((String) request.get("guestName"));
        reservation.setGuestEmail((String) request.get("guestEmail"));
        reservation.setGuestPhone((String) request.getOrDefault("guestPhone", null));
        reservation.setTotalPrice(((Number) request.getOrDefault("totalPrice", 0)).doubleValue());
        reservation.setAddons((String) request.getOrDefault("addons", null));
        reservation.setStatus(RoomReservation.Status.approved);

        // Availability check
        com.hotel.model.RoomType type = roomTypeRepository.findByName(reservation.getRoomType())
                .orElseThrow(() -> new RuntimeException("Room type not found"));

        long existingReservations = reservationRepository.countOverlappingApprovedReservations(
                reservation.getRoomType(),
                reservation.getCheckInDate(),
                reservation.getCheckOutDate());

        int roomCount = (type.getRoomCount() != null && type.getRoomCount() > 0) ? type.getRoomCount() : 1;

        // Debug logging
        System.out.println("=== Room Availability Check ===");
        System.out.println("Room Type: " + reservation.getRoomType());
        System.out
                .println("Check-in: " + reservation.getCheckInDate() + ", Check-out: " + reservation.getCheckOutDate());
        System.out.println("Total room count for this type: " + roomCount);
        System.out.println("Existing overlapping reservations: " + existingReservations);
        System.out.println("Available rooms: " + (roomCount - existingReservations));
        System.out.println("================================");

        if (existingReservations >= roomCount) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "No rooms available for the selected dates. " + existingReservations + " of "
                    + roomCount + " rooms already booked.");
            return ResponseEntity.status(400).body(errorResponse);
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
            String details = String.format("Room Type: %s%nCheck-in: %s%nCheck-out: %s%nGuest: %s%nTotal: Rs. %.2f",
                    reservation.getRoomType(),
                    reservation.getCheckInDate(),
                    reservation.getCheckOutDate(),
                    reservation.getGuestName(),
                    reservation.getTotalPrice());

            emailService.sendReservationApprovedEmail(
                    reservation.getGuestEmail(),
                    reservation.getGuestName(),
                    "Room",
                    details);
        } catch (Exception e) {
            System.err.println("Failed to send room reservation receipt email: " + e.getMessage());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Room reservation confirmed successfully!");
        Map<String, Object> data = new HashMap<>();
        data.put("id", reservation.getId());
        data.put("roomType", reservation.getRoomType());
        data.put("checkInDate", reservation.getCheckInDate());
        data.put("checkOutDate", reservation.getCheckOutDate());
        data.put("guestName", reservation.getGuestName());
        data.put("guestEmail", reservation.getGuestEmail());
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

        List<RoomReservation> reservations = reservationRepository.findByUserIdOrGuestEmailOrderByCreatedAtDesc(userId,
                email);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", reservations);

        return ResponseEntity.ok(response);
    }
}
