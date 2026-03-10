package com.hotel.controller;

import com.hotel.model.EventPlan;
import com.hotel.repository.EventPlanRepository;
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
@RequestMapping("/api/event-plans")
@CrossOrigin(origins = "*")
public class EventPlanController {

    @Autowired
    private EventPlanRepository eventPlanRepository;

    @Autowired
    private com.hotel.repository.EventTypeRepository eventTypeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private com.hotel.service.EmailService emailService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllEventPlans() {
        List<EventPlan> events = eventPlanRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", events);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createEventPlan(
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpRequest) {

        EventPlan eventPlan = new EventPlan();
        eventPlan.setEventType((String) request.get("eventType"));
        eventPlan.setEventDate(LocalDate.parse((String) request.get("eventDate")));
        eventPlan.setVenue((String) request.getOrDefault("venue", null));
        eventPlan.setGuestCount(((Number) request.get("guestCount")).intValue());
        eventPlan.setGuestName((String) request.get("guestName"));
        eventPlan.setGuestEmail((String) request.get("guestEmail"));
        eventPlan.setGuestPhone((String) request.getOrDefault("guestPhone", null));
        eventPlan.setSpecialRequests((String) request.getOrDefault("specialRequests", null));
        eventPlan.setTotalPrice(
                request.containsKey("totalPrice") ? ((Number) request.get("totalPrice")).doubleValue() : 0.0);
        eventPlan.setStatus(EventPlan.Status.approved);

        // Availability check - prevent double booking of same venue on same date
        String venue = eventPlan.getVenue();
        LocalDate eventDate = eventPlan.getEventDate();

        // Check if venue is provided
        if (venue == null || venue.trim().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Venue is required for event booking.");
            return ResponseEntity.status(400).body(errorResponse);
        }

        // Check for existing bookings with same date and venue
        long existingBookings = eventPlanRepository.countOverlappingEvents(eventDate, venue);

        // Debug logging
        System.out.println("=== Event Availability Check ===");
        System.out.println("Event Date: " + eventDate);
        System.out.println("Venue: " + venue);
        System.out.println("Existing bookings for this date and venue: " + existingBookings);
        System.out.println("================================");

        if (existingBookings > 0) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message",
                    "Event already booked for this date and venue. Please select a different date or venue.");
            return ResponseEntity.status(400).body(errorResponse);
        }

        // Get user ID if authenticated
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                Long userId = jwtUtil.getUserIdFromToken(token);
                eventPlan.setUserId(userId);
            } catch (Exception e) {
                // User not authenticated, continue without userId
            }
        }

        eventPlanRepository.save(eventPlan);

        // Send email notification
        try {
            String details = String.format("Event Type: %s%nDate: %s%nVenue: %s%nGuests: %d%nName: %s%nTotal: Rs. %.2f",
                    eventPlan.getEventType(),
                    eventPlan.getEventDate(),
                    eventPlan.getVenue() != null ? eventPlan.getVenue() : "TBD",
                    eventPlan.getGuestCount(),
                    eventPlan.getGuestName(),
                    eventPlan.getTotalPrice() != null ? eventPlan.getTotalPrice() : 0.0);

            emailService.sendReservationApprovedEmail(
                    eventPlan.getGuestEmail(),
                    eventPlan.getGuestName(),
                    "Event",
                    details);
        } catch (Exception e) {
            System.err.println("Failed to send event plan receipt email: " + e.getMessage());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Event plan confirmed successfully!");
        Map<String, Object> data = new HashMap<>();
        data.put("id", eventPlan.getId());
        data.put("eventType", eventPlan.getEventType());
        data.put("eventDate", eventPlan.getEventDate());
        data.put("venue", eventPlan.getVenue());
        data.put("guestCount", eventPlan.getGuestCount());
        data.put("status", eventPlan.getStatus().name());
        response.put("data", data);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-events")
    public ResponseEntity<Map<String, Object>> getMyEvents(Authentication authentication) {
        String email = authentication.getName();
        Long userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();

        List<EventPlan> events = eventPlanRepository.findByUserIdOrGuestEmailOrderByCreatedAtDesc(userId, email);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", events);

        return ResponseEntity.ok(response);
    }
}
