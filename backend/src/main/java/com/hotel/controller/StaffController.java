package com.hotel.controller;

import com.hotel.model.*;
import com.hotel.repository.*;
import com.hotel.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
public class StaffController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private RoomReservationRepository roomReservationRepository;

    @Autowired
    private DiningReservationRepository diningReservationRepository;

    @Autowired
    private EventPlanRepository eventPlanRepository;

    @Autowired
    private EmailService emailService;

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("phone_number", user.getPhoneNumber());
        profile.put("address", user.getAddress());
        profile.put("role", user.getRole().name());

        Optional<Staff> staffOpt = staffRepository.findByUserId(user.getId());
        if (staffOpt.isPresent()) {
            Staff staff = staffOpt.get();
            profile.put("employee_id", staff.getEmployeeId());
            profile.put("department", staff.getDepartment());
            profile.put("position", staff.getPosition());
            profile.put("hire_date", staff.getHireDate());
            // Salary removed as per request
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", profile);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.containsKey("name"))
            user.setName((String) request.get("name"));
        if (request.containsKey("phone_number"))
            user.setPhoneNumber((String) request.get("phone_number"));
        if (request.containsKey("address"))
            user.setAddress((String) request.get("address"));

        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Profile updated successfully");
        return ResponseEntity.ok(response);
    }

    // ========== ROOM RESERVATIONS ==========

    @GetMapping("/room-reservations")
    public ResponseEntity<Map<String, Object>> getAllRoomReservations() {
        List<RoomReservation> reservations = roomReservationRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", reservations);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/room-reservations/{id}/status")
    public ResponseEntity<Map<String, Object>> updateRoomReservationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String status = request.get("status");
        String reason = request.get("reason");

        RoomReservation reservation = roomReservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        reservation.setStatus(RoomReservation.Status.valueOf(status));
        if (reason != null) {
            reservation.setReason(reason);
        }
        roomReservationRepository.save(reservation);

        // Send email notification
        try {
            String details = String.format("Room Type: %s%nCheck-in: %s%nCheck-out: %s%nGuest: %s%nTotal: Rs. %.2f",
                    reservation.getRoomType(),
                    reservation.getCheckInDate(),
                    reservation.getCheckOutDate(),
                    reservation.getGuestName(),
                    reservation.getTotalPrice());

            if ("approved".equals(status)) {
                emailService.sendReservationApprovedEmail(
                        reservation.getGuestEmail(),
                        reservation.getGuestName(),
                        "Room",
                        details);
            } else if ("cancelled".equals(status)) {
                String cancelMsg = (reason != null && !reason.isEmpty()) ? reason
                        : "Unable to fulfill reservation at this time";
                emailService.sendReservationCancelledEmail(
                        reservation.getGuestEmail(),
                        reservation.getGuestName(),
                        "Room",
                        details,
                        cancelMsg);
            }
        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to send Room status update email: " + e.getMessage());
            e.printStackTrace();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Room reservation status updated to " + status);
        return ResponseEntity.ok(response);
    }

    // ========== DINING RESERVATIONS ==========

    @GetMapping("/dining-reservations")
    public ResponseEntity<Map<String, Object>> getAllDiningReservations() {
        List<DiningReservation> reservations = diningReservationRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", reservations);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/dining-reservations/{id}/status")
    public ResponseEntity<Map<String, Object>> updateDiningReservationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String status = request.get("status");
        String reason = request.get("reason");

        DiningReservation reservation = diningReservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        reservation.setStatus(DiningReservation.Status.valueOf(status));
        if (reason != null) {
            reservation.setReason(reason);
        }
        diningReservationRepository.save(reservation);

        // Send email notification
        try {
            String details = String.format(
                    "Occasion: %s%nDate: %s%nTime: %s%nGuests: %d%nName: %s%nTotal Price: Rs. %.2f",
                    reservation.getOccasion() != null ? reservation.getOccasion() : "Dining",
                    reservation.getReservationDate(),
                    reservation.getReservationTime(),
                    reservation.getGuestCount(),
                    reservation.getGuestName(),
                    reservation.getTotalPrice() != null ? reservation.getTotalPrice() : 0.0);

            if ("confirmed".equals(status) || "approved".equals(status)) {
                emailService.sendReservationApprovedEmail(
                        reservation.getGuestEmail(),
                        reservation.getGuestName(),
                        "Dining",
                        details);
            } else if ("cancelled".equals(status)) {
                String cancelMsg = (reason != null && !reason.isEmpty()) ? reason
                        : "Unable to accommodate your reservation";
                emailService.sendReservationCancelledEmail(
                        reservation.getGuestEmail(),
                        reservation.getGuestName(),
                        "Dining",
                        details,
                        cancelMsg);
            }
        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to send Dining status update email: " + e.getMessage());
            e.printStackTrace();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Dining reservation status updated to " + status);
        return ResponseEntity.ok(response);
    }

    // ========== EVENT PLANS ==========

    @GetMapping("/event-plans")
    public ResponseEntity<Map<String, Object>> getAllEventPlans() {
        List<EventPlan> reservations = eventPlanRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", reservations);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/event-plans/{id}/status")
    public ResponseEntity<Map<String, Object>> updateEventPlanStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String status = request.get("status");
        String reason = request.get("reason");

        EventPlan eventPlan = eventPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event plan not found"));

        eventPlan.setStatus(EventPlan.Status.valueOf(status));
        if (reason != null) {
            eventPlan.setReason(reason);
        }
        eventPlanRepository.save(eventPlan);

        // Send email notification
        try {
            String details = String.format(
                    "Event Type: %s%nDate: %s%nVenue: %s%nGuests: %d%nName: %s%nTotal Price: Rs. %.2f",
                    eventPlan.getEventType(),
                    eventPlan.getEventDate(),
                    eventPlan.getVenue(),
                    eventPlan.getGuestCount(),
                    eventPlan.getGuestName(),
                    eventPlan.getTotalPrice() != null ? eventPlan.getTotalPrice() : 0.0);

            if ("approved".equals(status)) {
                emailService.sendReservationApprovedEmail(
                        eventPlan.getGuestEmail(),
                        eventPlan.getGuestName(),
                        "Event",
                        details);
            } else if ("cancelled".equals(status)) {
                String cancelMsg = (reason != null && !reason.isEmpty()) ? reason
                        : "Unable to fulfill your event request at this time";
                emailService.sendReservationCancelledEmail(
                        eventPlan.getGuestEmail(),
                        eventPlan.getGuestName(),
                        "Event",
                        details,
                        cancelMsg);
            }
        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to send Event status update email: " + e.getMessage());
            e.printStackTrace();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Event plan status updated to " + status);
        return ResponseEntity.ok(response);
    }
}
