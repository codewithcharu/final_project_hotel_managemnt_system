package com.hotel.controller;

import com.hotel.model.RoomType;
import com.hotel.model.EventType;
import com.hotel.model.DiningType;
import com.hotel.repository.RoomTypeRepository;
import com.hotel.repository.EventTypeRepository;
import com.hotel.repository.DiningTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicController {

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private EventTypeRepository eventTypeRepository;

    @Autowired
    private DiningTypeRepository diningTypeRepository;

    // Public endpoint to get all available room types
    @GetMapping("/room-types")
    public ResponseEntity<Map<String, Object>> getPublicRoomTypes() {
        // Only return room types that are available
        List<RoomType> roomTypes = roomTypeRepository.findByIsAvailableTrue();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", roomTypes);
        return ResponseEntity.ok(response);
    }

    // Public endpoint to get all available dining types
    @GetMapping("/dining-types")
    public ResponseEntity<Map<String, Object>> getPublicDiningTypes() {
        List<DiningType> diningTypes = diningTypeRepository.findByIsAvailableTrue();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", diningTypes);
        return ResponseEntity.ok(response);
    }

    // Public endpoint to get all available event types
    @GetMapping("/event-types")
    public ResponseEntity<Map<String, Object>> getPublicEventTypes() {
        // Only return event types that are available
        List<EventType> eventTypes = eventTypeRepository.findByIsAvailableTrue();

        // Log for debugging
        System.out.println("PublicController: Found " + eventTypes.size() + " available event types");
        eventTypes.forEach(et -> {
            System.out.println(
                    "  - " + et.getName() + " (ID: " + et.getId() + ", Available: " + et.getIsAvailable() + ")");
        });

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", eventTypes);
        return ResponseEntity.ok(response);
    }
}
