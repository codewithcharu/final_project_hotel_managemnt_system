package com.hotel.controller;

import com.hotel.model.*;
import com.hotel.repository.*;
import com.hotel.security.JwtUtil;
import com.hotel.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Random;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private DiningTypeRepository diningTypeRepository;

    @Autowired
    private EventTypeRepository eventTypeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private DiningReservationRepository diningReservationRepository;

    @Autowired
    private RoomReservationRepository roomReservationRepository;

    @Autowired
    private EventPlanRepository eventPlanRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ContactInquiryRepository contactInquiryRepository;

    // ========== ROOM TYPES ==========
    @GetMapping("/room-types")
    public ResponseEntity<Map<String, Object>> getRoomTypes() {
        List<RoomType> roomTypes = roomTypeRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", roomTypes);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/room-types")
    public ResponseEntity<Map<String, Object>> createRoomType(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        RoomType roomType = new RoomType();
        roomType.setName((String) request.get("name"));
        roomType.setDescription((String) request.getOrDefault("description", null));
        roomType.setPricePerNight(((Number) request.get("price_per_night")).doubleValue());
        roomType.setCapacity(((Number) request.getOrDefault("capacity", 2)).intValue());
        roomType.setRoomCount(((Number) request.getOrDefault("room_count", 1)).intValue());
        roomType.setAmenities((String) request.getOrDefault("amenities", null));
        roomType.setImageUrl((String) request.getOrDefault("image_url", null));
        roomType.setIsAvailable((Boolean) request.getOrDefault("is_available", true));

        String email = authentication.getName();
        Long userId = userRepository.findByEmail(email).orElseThrow().getId();
        roomType.setCreatedBy(userId);

        roomTypeRepository.save(roomType);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Room type created successfully");
        response.put("data", Map.of("id", roomType.getId()));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/room-types/{id}")
    public ResponseEntity<Map<String, Object>> updateRoomType(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room type not found"));

        if (request.containsKey("name"))
            roomType.setName((String) request.get("name"));
        if (request.containsKey("description"))
            roomType.setDescription((String) request.get("description"));
        if (request.containsKey("price_per_night"))
            roomType.setPricePerNight(((Number) request.get("price_per_night")).doubleValue());
        if (request.containsKey("capacity"))
            roomType.setCapacity(((Number) request.get("capacity")).intValue());
        if (request.containsKey("room_count"))
            roomType.setRoomCount(((Number) request.get("room_count")).intValue());
        if (request.containsKey("amenities"))
            roomType.setAmenities((String) request.get("amenities"));
        if (request.containsKey("image_url"))
            roomType.setImageUrl((String) request.get("image_url"));
        if (request.containsKey("is_available"))
            roomType.setIsAvailable((Boolean) request.get("is_available"));

        roomTypeRepository.save(roomType);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Room type updated successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/room-types/{id}")
    public ResponseEntity<Map<String, Object>> deleteRoomType(@PathVariable Long id) {
        roomTypeRepository.deleteById(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Room type deleted successfully");
        return ResponseEntity.ok(response);
    }

    // ========== DINING TYPES ==========
    @GetMapping("/dining-types")
    public ResponseEntity<Map<String, Object>> getDiningTypes() {
        List<DiningType> diningTypes = diningTypeRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", diningTypes);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/dining-types")
    public ResponseEntity<Map<String, Object>> createDiningType(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        DiningType diningType = new DiningType();
        diningType.setName((String) request.get("name"));
        diningType.setDescription((String) request.getOrDefault("description", null));
        diningType.setCategory(DiningType.Category.valueOf((String) request.get("category")));
        diningType.setPrice(((Number) request.get("price")).doubleValue());
        diningType.setImageUrl((String) request.getOrDefault("image_url", null));
        diningType.setIsAvailable((Boolean) request.getOrDefault("is_available", true));

        String email = authentication.getName();
        Long userId = userRepository.findByEmail(email).orElseThrow().getId();
        diningType.setCreatedBy(userId);

        diningTypeRepository.save(diningType);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Dining type created successfully");
        response.put("data", Map.of("id", diningType.getId()));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/dining-types/{id}")
    public ResponseEntity<Map<String, Object>> updateDiningType(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        DiningType diningType = diningTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dining type not found"));

        if (request.containsKey("name"))
            diningType.setName((String) request.get("name"));
        if (request.containsKey("description"))
            diningType.setDescription((String) request.get("description"));
        if (request.containsKey("category"))
            diningType.setCategory(DiningType.Category.valueOf((String) request.get("category")));
        if (request.containsKey("price"))
            diningType.setPrice(((Number) request.get("price")).doubleValue());
        if (request.containsKey("image_url"))
            diningType.setImageUrl((String) request.get("image_url"));
        if (request.containsKey("is_available"))
            diningType.setIsAvailable((Boolean) request.get("is_available"));

        diningTypeRepository.save(diningType);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Dining type updated successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/dining-types/{id}")
    public ResponseEntity<Map<String, Object>> deleteDiningType(@PathVariable Long id) {
        diningTypeRepository.deleteById(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Dining type deleted successfully");
        return ResponseEntity.ok(response);
    }

    // ========== EVENT TYPES ==========
    @GetMapping("/event-types")
    public ResponseEntity<Map<String, Object>> getEventTypes() {
        List<EventType> eventTypes = eventTypeRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", eventTypes);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/event-types")
    public ResponseEntity<Map<String, Object>> createEventType(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        EventType eventType = new EventType();
        eventType.setName((String) request.get("name"));
        eventType.setDescription((String) request.getOrDefault("description", null));
        eventType.setBasePrice(((Number) request.get("base_price")).doubleValue());
        eventType.setCapacity(((Number) request.get("capacity")).intValue());
        eventType.setVenueOptions((String) request.getOrDefault("venue_options", null));
        eventType.setImageUrl((String) request.getOrDefault("image_url", null));
        eventType.setIsAvailable((Boolean) request.getOrDefault("is_available", true));

        String email = authentication.getName();
        Long userId = userRepository.findByEmail(email).orElseThrow().getId();
        eventType.setCreatedBy(userId);

        eventTypeRepository.save(eventType);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Event type created successfully");
        response.put("data", Map.of("id", eventType.getId()));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/event-types/{id}")
    public ResponseEntity<Map<String, Object>> updateEventType(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        EventType eventType = eventTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event type not found"));

        if (request.containsKey("name"))
            eventType.setName((String) request.get("name"));
        if (request.containsKey("description"))
            eventType.setDescription((String) request.get("description"));
        if (request.containsKey("base_price"))
            eventType.setBasePrice(((Number) request.get("base_price")).doubleValue());
        if (request.containsKey("capacity"))
            eventType.setCapacity(((Number) request.get("capacity")).intValue());
        if (request.containsKey("venue_options"))
            eventType.setVenueOptions((String) request.get("venue_options"));
        if (request.containsKey("image_url"))
            eventType.setImageUrl((String) request.get("image_url"));
        if (request.containsKey("is_available"))
            eventType.setIsAvailable((Boolean) request.get("is_available"));

        eventTypeRepository.save(eventType);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Event type updated successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/event-types/{id}")
    public ResponseEntity<Map<String, Object>> deleteEventType(@PathVariable Long id) {
        eventTypeRepository.deleteById(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Event type deleted successfully");
        return ResponseEntity.ok(response);
    }

    // ========== STAFF MANAGEMENT ==========
    @GetMapping("/staff")
    public ResponseEntity<Map<String, Object>> getStaff() {
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.staff || u.getRole() == User.Role.kitchen_admin)
                .collect(Collectors.toList());

        List<Map<String, Object>> staffList = new ArrayList<>();
        for (User user : users) {
            Map<String, Object> staffData = new HashMap<>();
            staffData.put("id", user.getId());
            staffData.put("name", user.getName());
            staffData.put("email", user.getEmail());
            staffData.put("phone_number", user.getPhoneNumber());
            staffData.put("role", user.getRole().name());
            staffData.put("is_active", user.getIsActive());

            Optional<Staff> staff = staffRepository.findByUserId(user.getId());
            if (staff.isPresent()) {
                staffData.put("employee_id", staff.get().getEmployeeId());
                staffData.put("department", staff.get().getDepartment());
                staffData.put("position", staff.get().getPosition());
                staffData.put("hire_date", staff.get().getHireDate());
            }

            staffList.add(staffData);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", staffList);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/staff")
    public ResponseEntity<Map<String, Object>> createStaff(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        String email = (String) request.get("email");
        String name = (String) request.get("name");
        String roleStr = (String) request.get("role");

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User with this email already exists");
        }

        // Generate random password
        String generatedPassword = generatePassword();
        String hashedPassword = passwordEncoder.encode(generatedPassword);

        User user = new User();
        user.setName(name);
        user.setNic((String) request.getOrDefault("nic", null));
        user.setEmail(email);
        user.setPassword(hashedPassword);
        user.setPhoneNumber((String) request.getOrDefault("phone_number", null));
        user.setAddress((String) request.getOrDefault("address", null));
        user.setRole(User.Role.valueOf(roleStr));
        user.setEmailVerified(true);
        user.setIsActive(true);

        user = userRepository.save(user);

        // Auto-generate employee ID if not provided
        String employeeId = (String) request.getOrDefault("employee_id", null);
        if (employeeId == null || employeeId.trim().isEmpty()) {
            // Generate employee ID: EMP + timestamp + random 3 digits
            String timestamp = String.valueOf(System.currentTimeMillis()).substring(7);
            String random = String.format("%03d", new Random().nextInt(1000));
            employeeId = "EMP" + timestamp + random;
        }

        String position = (String) request.getOrDefault("position", null);

        // Create staff record (always create for staff/kitchen_admin)
        Staff staff = new Staff();
        staff.setUserId(user.getId());
        staff.setEmployeeId(employeeId);
        staff.setDepartment((String) request.getOrDefault("department", null));
        staff.setPosition(position);
        if (request.containsKey("hire_date") && request.get("hire_date") != null
                && !request.get("hire_date").toString().trim().isEmpty()) {
            staff.setHireDate(LocalDate.parse((String) request.get("hire_date")));
        }
        staffRepository.save(staff);

        // Send credentials email
        try {
            emailService.sendStaffCredentials(email, name, generatedPassword, roleStr);
        } catch (Exception e) {
            // Email failed, but account created - return password in response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message",
                    "Staff member created successfully, but email could not be sent. Please provide credentials manually.");
            Map<String, Object> data = new HashMap<>();
            data.put("id", user.getId());
            data.put("employee_id", employeeId);
            data.put("email", email);
            data.put("password", generatedPassword);
            data.put("note", "Email delivery failed. Please provide these credentials to the user manually.");
            response.put("data", data);
            return ResponseEntity.ok(response);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Staff member created successfully. Credentials have been sent to their email.");
        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("employee_id", employeeId);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/staff/{id}")
    public ResponseEntity<Map<String, Object>> updateStaff(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));

        if (request.containsKey("name"))
            user.setName((String) request.get("name"));
        if (request.containsKey("email"))
            user.setEmail((String) request.get("email"));
        if (request.containsKey("phone_number"))
            user.setPhoneNumber((String) request.get("phone_number"));
        if (request.containsKey("address"))
            user.setAddress((String) request.get("address"));
        if (request.containsKey("role"))
            user.setRole(User.Role.valueOf((String) request.get("role")));
        if (request.containsKey("is_active"))
            user.setIsActive((Boolean) request.get("is_active"));

        userRepository.save(user);

        // Update staff record
        Optional<Staff> staffOpt = staffRepository.findByUserId(id);
        if (staffOpt.isPresent()) {
            Staff staff = staffOpt.get();
            if (request.containsKey("employee_id"))
                staff.setEmployeeId((String) request.get("employee_id"));
            if (request.containsKey("department"))
                staff.setDepartment((String) request.get("department"));
            if (request.containsKey("position"))
                staff.setPosition((String) request.get("position"));
            if (request.containsKey("hire_date"))
                staff.setHireDate(LocalDate.parse((String) request.get("hire_date")));
            staffRepository.save(staff);
        } else if (request.containsKey("employee_id") || request.containsKey("department")) {
            Staff staff = new Staff();
            staff.setUserId(id);
            staff.setEmployeeId((String) request.getOrDefault("employee_id", null));
            staff.setDepartment((String) request.getOrDefault("department", null));
            if (request.containsKey("hire_date")) {
                staff.setHireDate(LocalDate.parse((String) request.get("hire_date")));
            }
            staffRepository.save(staff);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Staff member updated successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/staff/{id}")
    public ResponseEntity<Map<String, Object>> deleteStaff(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow();
        user.setIsActive(false);
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Staff member disabled successfully");
        return ResponseEntity.ok(response);
    }

    // ========== INVENTORY ==========
    @GetMapping("/inventory")
    public ResponseEntity<Map<String, Object>> getInventory(@RequestParam(required = false) String type) {
        try {
            List<Inventory> inventoryList = inventoryRepository.findAll();

            if (type != null && !type.isEmpty()) {
                // Category filtering removed as InventoryCategory is no longer used
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", inventoryList != null ? inventoryList : new ArrayList<>());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to load inventory: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/inventory")
    public ResponseEntity<Map<String, Object>> createInventory(@RequestBody Map<String, Object> request) {
        Inventory inventory = new Inventory();
        inventory.setName((String) request.get("name"));
        inventory.setDescription((String) request.getOrDefault("description", null));
        inventory.setQuantity(((Number) request.getOrDefault("quantity", 0)).intValue());
        inventory.setUnit((String) request.getOrDefault("unit", "unit"));
        inventory.setMinStockLevel(((Number) request.getOrDefault("min_stock_level", 10)).intValue());
        inventory.setMaxStockLevel(((Number) request.getOrDefault("max_stock_level", 1000)).intValue());
        inventory.setCostPerUnit(
                request.containsKey("cost_per_unit") ? ((Number) request.get("cost_per_unit")).doubleValue() : null);
        inventory.setSupplier((String) request.getOrDefault("supplier", null));

        inventoryRepository.save(inventory);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Inventory item created successfully");
        response.put("data", Map.of("id", inventory.getId()));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/inventory/{id}")
    public ResponseEntity<Map<String, Object>> updateInventory(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));

        if (request.containsKey("name"))
            inventory.setName((String) request.get("name"));
        if (request.containsKey("description"))
            inventory.setDescription((String) request.get("description"));
        if (request.containsKey("quantity"))
            inventory.setQuantity(((Number) request.get("quantity")).intValue());
        if (request.containsKey("unit"))
            inventory.setUnit((String) request.get("unit"));
        if (request.containsKey("min_stock_level"))
            inventory.setMinStockLevel(((Number) request.get("min_stock_level")).intValue());
        if (request.containsKey("max_stock_level"))
            inventory.setMaxStockLevel(((Number) request.get("max_stock_level")).intValue());
        if (request.containsKey("cost_per_unit"))
            inventory.setCostPerUnit(((Number) request.get("cost_per_unit")).doubleValue());
        if (request.containsKey("supplier"))
            inventory.setSupplier((String) request.get("supplier"));
        if (request.containsKey("last_restocked"))
            inventory.setLastRestocked(LocalDate.parse((String) request.get("last_restocked")));

        inventoryRepository.save(inventory);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Inventory item updated successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/inventory/{id}")
    public ResponseEntity<Map<String, Object>> deleteInventory(@PathVariable Long id) {
        inventoryRepository.deleteById(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Inventory item deleted successfully");
        return ResponseEntity.ok(response);
    }

    // ========== KITCHEN ORDERS ==========
    @GetMapping("/kitchen-orders")
    public ResponseEntity<Map<String, Object>> getKitchenOrders(@RequestParam(required = false) String status) {
        List<DiningReservation> orders = diningReservationRepository.findAll();

        if (status != null) {
            orders = orders.stream()
                    .filter(o -> o.getOrderStatus().name().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", orders);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/kitchen-orders/{id}/status")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        DiningReservation order = diningReservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setOrderStatus(DiningReservation.OrderStatus.valueOf(request.get("order_status")));
        diningReservationRepository.save(order);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Order status updated successfully");
        return ResponseEntity.ok(response);
    }

    // ========== USER MANAGEMENT ==========
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> userList = users.stream()
                .map(u -> {
                    Map<String, Object> userData = new HashMap<>();
                    userData.put("id", u.getId());
                    userData.put("name", u.getName());
                    userData.put("email", u.getEmail());
                    userData.put("phone_number", u.getPhoneNumber());
                    userData.put("role", u.getRole().name());
                    userData.put("is_active", u.getIsActive());
                    userData.put("created_at", u.getCreatedAt());
                    return userData;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", userList);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.containsKey("is_active"))
            user.setIsActive((Boolean) request.get("is_active"));
        if (request.containsKey("role"))
            user.setRole(User.Role.valueOf((String) request.get("role")));

        // Admin can change user password
        if (request.containsKey("password") && request.get("password") != null) {
            String newPassword = (String) request.get("password");
            user.setPassword(passwordEncoder.encode(newPassword));
        }

        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "User updated successfully");
        return ResponseEntity.ok(response);
    }

    // ========== REPORTS ==========
    @GetMapping("/reports/summary")
    public ResponseEntity<Map<String, Object>> getReports() {
        try {
            List<RoomReservation> roomReservations = roomReservationRepository.findAll();
            List<DiningReservation> diningReservations = diningReservationRepository.findAll();
            List<EventPlan> eventPlans = eventPlanRepository.findAll();
            List<User> users = userRepository.findAll();

            Map<String, Object> roomStats = new HashMap<>();
            roomStats.put("total_reservations", roomReservations != null ? roomReservations.size() : 0);
            roomStats.put("pending", roomReservations != null ? roomReservations.stream()
                    .filter(r -> r.getStatus() != null && r.getStatus() == RoomReservation.Status.pending).count() : 0);
            roomStats.put("approved", roomReservations != null ? roomReservations.stream()
                    .filter(r -> r.getStatus() != null && r.getStatus() == RoomReservation.Status.approved).count()
                    : 0);
            roomStats.put("completed", roomReservations != null ? roomReservations.stream()
                    .filter(r -> r.getStatus() != null && r.getStatus() == RoomReservation.Status.completed).count()
                    : 0);
            roomStats.put("total_revenue", roomReservations != null ? roomReservations.stream()
                    .filter(r -> r.getTotalPrice() != null && (r.getStatus() == RoomReservation.Status.approved
                            || r.getStatus() == RoomReservation.Status.completed))
                    .mapToDouble(RoomReservation::getTotalPrice).sum() : 0.0);

            Map<String, Object> diningStats = new HashMap<>();
            diningStats.put("total_reservations", diningReservations != null ? diningReservations.size() : 0);
            diningStats.put("pending", diningReservations != null ? diningReservations.stream()
                    .filter(r -> r.getStatus() != null && r.getStatus() == DiningReservation.Status.pending).count()
                    : 0);
            diningStats.put("confirmed", diningReservations != null ? diningReservations.stream()
                    .filter(r -> r.getStatus() != null && r.getStatus() == DiningReservation.Status.confirmed).count()
                    : 0);
            double totalDiningRevenue = 0;
            if (diningReservations != null) {
                for (DiningReservation res : diningReservations) {
                    if (res.getStatus() == DiningReservation.Status.confirmed
                            || res.getStatus() == DiningReservation.Status.completed) {
                        if (res.getTotalPrice() != null) {
                            totalDiningRevenue += res.getTotalPrice();
                        } else if (res.getDiningTypeId() != null) {
                            // Fallback for existing data: try to get from DiningType
                            Optional<DiningType> type = diningTypeRepository.findById(res.getDiningTypeId());
                            if (type.isPresent()) {
                                totalDiningRevenue += type.get().getPrice()
                                        * (res.getGuestCount() != null ? res.getGuestCount() : 1);
                            } else {
                                totalDiningRevenue += (res.getGuestCount() != null ? res.getGuestCount() : 1) * 1500.0;
                            }
                        } else {
                            totalDiningRevenue += (res.getGuestCount() != null ? res.getGuestCount() : 1) * 1500.0;
                        }
                    }
                }
            }
            diningStats.put("total_revenue", totalDiningRevenue);

            Map<String, Object> eventStats = new HashMap<>();
            eventStats.put("total_events", eventPlans != null ? eventPlans.size() : 0);
            eventStats.put("pending", eventPlans != null ? eventPlans.stream()
                    .filter(e -> e.getStatus() != null && e.getStatus() == EventPlan.Status.pending).count() : 0);
            eventStats.put("approved", eventPlans != null ? eventPlans.stream()
                    .filter(e -> e.getStatus() != null && e.getStatus() == EventPlan.Status.approved).count() : 0);
            double totalEventRevenue = 0;
            if (eventPlans != null) {
                for (EventPlan res : eventPlans) {
                    if (res.getStatus() == EventPlan.Status.approved || res.getStatus() == EventPlan.Status.completed) {
                        if (res.getTotalPrice() != null) {
                            totalEventRevenue += res.getTotalPrice();
                        } else if (res.getEventTypeId() != null) {
                            // Fallback for existing data
                            Optional<EventType> type = eventTypeRepository.findById(res.getEventTypeId());
                            if (type.isPresent()) {
                                totalEventRevenue += type.get().getBasePrice();
                            } else {
                                totalEventRevenue += 50000.0;
                            }
                        } else {
                            totalEventRevenue += 50000.0;
                        }
                    }
                }
            }
            eventStats.put("total_revenue", totalEventRevenue);

            Map<String, Object> userStats = new HashMap<>();
            userStats.put("total_users", users != null ? users.size() : 0);
            userStats.put("customers", users != null ? users.stream()
                    .filter(u -> u.getRole() != null && u.getRole() == User.Role.customer).count() : 0);
            userStats.put("staff_count", users != null ? users.stream()
                    .filter(u -> u.getRole() != null && u.getRole() == User.Role.staff).count() : 0);

            Map<String, Object> data = new HashMap<>();
            data.put("rooms", roomStats);
            data.put("dining", diningStats);
            data.put("events", eventStats);
            data.put("users", userStats);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to load reports: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/reports/revenue")
    public ResponseEntity<Map<String, Object>> getDetailedRevenueReport(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String monthFilter) {
        try {
            List<RoomReservation> roomReservations = roomReservationRepository.findAll();
            List<DiningReservation> diningReservations = diningReservationRepository.findAll();
            List<EventPlan> eventPlans = eventPlanRepository.findAll();

            Map<String, Double> monthlyRoomRevenue = new TreeMap<>();
            Map<String, Double> monthlyDiningRevenue = new TreeMap<>();
            Map<String, Double> monthlyEventRevenue = new TreeMap<>();

            double totalRoomRevenue = 0;
            double totalDiningRevenue = 0;
            double totalEventRevenue = 0;

            // Process Room Revenue
            if (roomReservations != null) {
                for (RoomReservation res : roomReservations) {
                    // Filter by status
                    if (res.getStatus() != RoomReservation.Status.approved
                            && res.getStatus() != RoomReservation.Status.completed)
                        continue;

                    // Filter by date/month
                    String resDate = res.getCheckInDate() != null ? res.getCheckInDate().toString() : "";
                    if (date != null && !date.equals(resDate))
                        continue;
                    if (monthFilter != null && !resDate.startsWith(monthFilter))
                        continue;

                    double price = res.getTotalPrice() != null ? res.getTotalPrice() : 0.0;
                    totalRoomRevenue += price;
                    String m = resDate.length() >= 7 ? resDate.substring(0, 7) : "Unknown";
                    monthlyRoomRevenue.put(m, monthlyRoomRevenue.getOrDefault(m, 0.0) + price);
                }
            }

            // Process Dining Revenue
            if (diningReservations != null) {
                for (DiningReservation res : diningReservations) {
                    // Filter by status
                    if (res.getStatus() != DiningReservation.Status.confirmed
                            && res.getStatus() != DiningReservation.Status.completed)
                        continue;

                    // Filter by date/month
                    String resDate = res.getReservationDate() != null ? res.getReservationDate().toString() : "";
                    if (date != null && !date.equals(resDate))
                        continue;
                    if (monthFilter != null && !resDate.startsWith(monthFilter))
                        continue;

                    double price = 0;
                    if (res.getTotalPrice() != null) {
                        price = res.getTotalPrice();
                    } else {
                        // Fallback logic
                        if (res.getDiningTypeId() != null) {
                            Optional<DiningType> type = diningTypeRepository.findById(res.getDiningTypeId());
                            price = type.isPresent()
                                    ? (type.get().getPrice() * (res.getGuestCount() != null ? res.getGuestCount() : 1))
                                    : ((res.getGuestCount() != null ? res.getGuestCount() : 1) * 1500.0);
                        } else {
                            price = (res.getGuestCount() != null ? res.getGuestCount() : 1) * 1500.0;
                        }
                    }
                    totalDiningRevenue += price;
                    String m = resDate.length() >= 7 ? resDate.substring(0, 7) : "Unknown";
                    monthlyDiningRevenue.put(m, monthlyDiningRevenue.getOrDefault(m, 0.0) + price);
                }
            }

            // Process Event Revenue
            if (eventPlans != null) {
                for (EventPlan res : eventPlans) {
                    // Filter by status
                    if (res.getStatus() != EventPlan.Status.approved && res.getStatus() != EventPlan.Status.completed)
                        continue;

                    // Filter by date/month
                    String resDate = res.getEventDate() != null ? res.getEventDate().toString() : "";
                    if (date != null && !date.equals(resDate))
                        continue;
                    if (monthFilter != null && !resDate.startsWith(monthFilter))
                        continue;

                    double price = 0;
                    if (res.getTotalPrice() != null) {
                        price = res.getTotalPrice();
                    } else {
                        // Fallback logic
                        if (res.getEventTypeId() != null) {
                            Optional<EventType> type = eventTypeRepository.findById(res.getEventTypeId());
                            price = type.isPresent() ? type.get().getBasePrice() : 50000.0;
                        } else {
                            price = 50000.0;
                        }
                    }
                    totalEventRevenue += price;
                    String m = resDate.length() >= 7 ? resDate.substring(0, 7) : "Unknown";
                    monthlyEventRevenue.put(m, monthlyEventRevenue.getOrDefault(m, 0.0) + price);
                }
            }

            Map<String, Object> data = new HashMap<>();
            data.put("rooms", Map.of("monthly", monthlyRoomRevenue, "total", totalRoomRevenue));
            data.put("dining", Map.of("monthly", monthlyDiningRevenue, "total", totalDiningRevenue));
            data.put("events", Map.of("monthly", monthlyEventRevenue, "total", totalEventRevenue));

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to load detailed reports: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    private String generatePassword() {
        String chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        Random random = new Random();
        StringBuilder password = new StringBuilder();

        // Ensure at least one of each type
        password.append("abcdefghijklmnopqrstuvwxyz".charAt(random.nextInt(26)));
        password.append("ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(random.nextInt(26)));
        password.append("0123456789".charAt(random.nextInt(10)));
        password.append("!@#$%^&*".charAt(random.nextInt(8)));

        // Fill the rest
        for (int i = password.length(); i < 12; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }

        // Shuffle
        List<Character> charsList = password.chars().mapToObj(c -> (char) c).collect(Collectors.toList());
        Collections.shuffle(charsList);
        return charsList.stream().map(String::valueOf).collect(Collectors.joining());
    }

    // ========== RESERVATION MANAGEMENT ==========

    // GET ALL ROOM RESERVATIONS
    @GetMapping("/room-reservations")
    public ResponseEntity<Map<String, Object>> getAllRoomReservations() {
        try {
            List<RoomReservation> reservations = roomReservationRepository.findAll();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", reservations);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // UPDATE ROOM RESERVATION STATUS (Approve/Cancel)
    @PutMapping("/room-reservations/{id}/status")
    public ResponseEntity<Map<String, Object>> updateRoomReservationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            RoomReservation reservation = roomReservationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Reservation not found"));

            String newStatus = request.get("status");
            reservation.setStatus(RoomReservation.Status.valueOf(newStatus));
            roomReservationRepository.save(reservation);

            // Send email notification
            String details = String.format("Room Type: %s%nCheck-in: %s%nCheck-out: %s%nGuest: %s%nTotal: Rs. %.2f",
                    reservation.getRoomType(),
                    reservation.getCheckInDate(),
                    reservation.getCheckOutDate(),
                    reservation.getGuestName(),
                    reservation.getTotalPrice());

            if ("approved".equals(newStatus)) {
                emailService.sendReservationApprovedEmail(
                        reservation.getGuestEmail(),
                        reservation.getGuestName(),
                        "Room",
                        details);
            } else if ("cancelled".equals(newStatus)) {
                String reason = request.getOrDefault("reason", "Unable to fulfill reservation at this time");
                emailService.sendReservationCancelledEmail(
                        reservation.getGuestEmail(),
                        reservation.getGuestName(),
                        "Room",
                        details,
                        reason);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Reservation status updated successfully");
            response.put("data", reservation);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // UPDATE ROOM RESERVATION DETAILS
    @PutMapping("/room-reservations/{id}")
    public ResponseEntity<Map<String, Object>> updateRoomReservation(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            RoomReservation reservation = roomReservationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Reservation not found"));

            // Update fields
            if (request.containsKey("roomType"))
                reservation.setRoomType((String) request.get("roomType"));
            if (request.containsKey("checkInDate"))
                reservation.setCheckInDate(LocalDate.parse((String) request.get("checkInDate")));
            if (request.containsKey("checkOutDate"))
                reservation.setCheckOutDate(LocalDate.parse((String) request.get("checkOutDate")));
            if (request.containsKey("guestName"))
                reservation.setGuestName((String) request.get("guestName"));
            if (request.containsKey("guestEmail"))
                reservation.setGuestEmail((String) request.get("guestEmail"));
            if (request.containsKey("guestPhone"))
                reservation.setGuestPhone((String) request.get("guestPhone"));
            if (request.containsKey("totalPrice"))
                reservation.setTotalPrice(((Number) request.get("totalPrice")).doubleValue());

            roomReservationRepository.save(reservation);

            // Send update email
            String details = String.format("Room Type: %s%nCheck-in: %s%nCheck-out: %s%nGuest: %s",
                    reservation.getRoomType(),
                    reservation.getCheckInDate(),
                    reservation.getCheckOutDate(),
                    reservation.getGuestName());

            emailService.sendReservationUpdatedEmail(
                    reservation.getGuestEmail(),
                    reservation.getGuestName(),
                    "Room",
                    "",
                    details);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Reservation updated successfully");
            response.put("data", reservation);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // GET ALL DINING RESERVATIONS
    @GetMapping("/dining-reservations")
    public ResponseEntity<Map<String, Object>> getAllDiningReservations() {
        try {
            List<DiningReservation> reservations = diningReservationRepository.findAll();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", reservations);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // UPDATE DINING RESERVATION STATUS
    @PutMapping("/dining-reservations/{id}/status")
    public ResponseEntity<Map<String, Object>> updateDiningReservationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            DiningReservation reservation = diningReservationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Reservation not found"));

            String newStatus = request.get("status");
            reservation.setStatus(DiningReservation.Status.valueOf(newStatus));
            diningReservationRepository.save(reservation);

            // Send email notification
            String details = String.format("Occasion: %s%nDate: %s%nTime: %s%nGuests: %d%nName: %s",
                    reservation.getOccasion() != null ? reservation.getOccasion() : "Dining",
                    reservation.getReservationDate(),
                    reservation.getReservationTime(),
                    reservation.getGuestCount(),
                    reservation.getGuestName());

            if ("confirmed".equals(newStatus) || "approved".equals(newStatus)) {
                emailService.sendReservationApprovedEmail(
                        reservation.getGuestEmail(),
                        reservation.getGuestName(),
                        "Dining",
                        details);
            } else if ("cancelled".equals(newStatus)) {
                String reason = request.getOrDefault("reason", "Unable to accommodate your reservation");
                emailService.sendReservationCancelledEmail(
                        reservation.getGuestEmail(),
                        reservation.getGuestName(),
                        "Dining",
                        details,
                        reason);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Dining reservation status updated successfully");
            response.put("data", reservation);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // UPDATE DINING RESERVATION
    @PutMapping("/dining-reservations/{id}")
    public ResponseEntity<Map<String, Object>> updateDiningReservation(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            DiningReservation reservation = diningReservationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Reservation not found"));

            // Update fields
            if (request.containsKey("occasion"))
                reservation.setOccasion((String) request.get("occasion"));
            if (request.containsKey("reservationDate"))
                reservation.setReservationDate(LocalDate.parse((String) request.get("reservationDate")));
            if (request.containsKey("reservationTime"))
                reservation.setReservationTime(LocalTime.parse((String) request.get("reservationTime")));
            if (request.containsKey("guestCount"))
                reservation.setGuestCount(((Number) request.get("guestCount")).intValue());
            if (request.containsKey("guestName"))
                reservation.setGuestName((String) request.get("guestName"));
            if (request.containsKey("guestEmail"))
                reservation.setGuestEmail((String) request.get("guestEmail"));
            if (request.containsKey("guestPhone"))
                reservation.setGuestPhone((String) request.get("guestPhone"));
            if (request.containsKey("specialRequests"))
                reservation.setSpecialRequests((String) request.get("specialRequests"));
            if (request.containsKey("totalPrice"))
                reservation.setTotalPrice(((Number) request.get("totalPrice")).doubleValue());

            diningReservationRepository.save(reservation);

            // Send update email
            String details = String.format("Occasion: %s%nDate: %s%nTime: %s%nGuests: %d",
                    reservation.getOccasion(),
                    reservation.getReservationDate(),
                    reservation.getReservationTime(),
                    reservation.getGuestCount());

            emailService.sendReservationUpdatedEmail(
                    reservation.getGuestEmail(),
                    reservation.getGuestName(),
                    "Dining",
                    "",
                    details);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Dining reservation updated successfully");
            response.put("data", reservation);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // GET ALL EVENT PLANS
    @GetMapping("/event-plans")
    public ResponseEntity<Map<String, Object>> getAllEventPlans() {
        try {
            List<EventPlan> events = eventPlanRepository.findAll();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", events);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // UPDATE EVENT PLAN
    @PutMapping("/event-plans/{id}")
    public ResponseEntity<Map<String, Object>> updateEventPlan(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            EventPlan event = eventPlanRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Event plan not found"));

            // Update fields
            if (request.containsKey("eventType"))
                event.setEventType((String) request.get("eventType"));
            if (request.containsKey("eventDate"))
                event.setEventDate(LocalDate.parse((String) request.get("eventDate")));
            if (request.containsKey("venue"))
                event.setVenue((String) request.get("venue"));
            if (request.containsKey("guestCount"))
                event.setGuestCount(((Number) request.get("guestCount")).intValue());
            if (request.containsKey("guestName"))
                event.setGuestName((String) request.get("guestName"));
            if (request.containsKey("guestEmail"))
                event.setGuestEmail((String) request.get("guestEmail"));
            if (request.containsKey("guestPhone"))
                event.setGuestPhone((String) request.get("guestPhone"));
            if (request.containsKey("specialRequests"))
                event.setSpecialRequests((String) request.get("specialRequests"));
            if (request.containsKey("totalPrice"))
                event.setTotalPrice(((Number) request.get("totalPrice")).doubleValue());

            eventPlanRepository.save(event);

            // Send update email
            String details = String.format("Event Type: %s%nDate: %s%nVenue: %s%nGuests: %d",
                    event.getEventType(),
                    event.getEventDate(),
                    event.getVenue() != null ? event.getVenue() : "TBD",
                    event.getGuestCount());

            emailService.sendReservationUpdatedEmail(
                    event.getGuestEmail(),
                    event.getGuestName(),
                    "Event",
                    "",
                    details);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Event plan updated successfully");
            response.put("data", event);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // UPDATE EVENT PLAN STATUS
    @PutMapping("/event-plans/{id}/status")
    public ResponseEntity<Map<String, Object>> updateEventPlanStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            EventPlan event = eventPlanRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Event plan not found"));

            String newStatus = request.get("status");
            event.setStatus(EventPlan.Status.valueOf(newStatus));
            eventPlanRepository.save(event);

            // Send email notification
            String details = String.format("Event Type: %s%nDate: %s%nVenue: %s%nGuests: %d%nName: %s",
                    event.getEventType(),
                    event.getEventDate(),
                    event.getVenue() != null ? event.getVenue() : "TBD",
                    event.getGuestCount(),
                    event.getGuestName());

            if ("approved".equals(newStatus)) {
                emailService.sendReservationApprovedEmail(
                        event.getGuestEmail(),
                        event.getGuestName(),
                        "Event",
                        details);
            } else if ("cancelled".equals(newStatus)) {
                String reason = request.getOrDefault("reason", "Unable to host your event");
                emailService.sendReservationCancelledEmail(
                        event.getGuestEmail(),
                        event.getGuestName(),
                        "Event",
                        details,
                        reason);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Event plan status updated successfully");
            response.put("data", event);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // ========== CONTACT INQUIRIES ==========
    @GetMapping("/contact-inquiries")
    public ResponseEntity<Map<String, Object>> getContactInquiries(@RequestParam(required = false) String status) {
        List<ContactInquiry> inquiries = contactInquiryRepository.findAll();

        if (status != null && !status.isEmpty()) {
            try {
                ContactInquiry.Status queryStatus = ContactInquiry.Status.valueOf(status);
                inquiries = inquiries.stream()
                        .filter(i -> i.getStatus() == queryStatus)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Ignore
            }
        }

        inquiries.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", inquiries);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/contact-inquiries/{id}/status")
    public ResponseEntity<Map<String, Object>> updateInquiryStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        ContactInquiry inquiry = contactInquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inquiry not found"));

        String statusStr = request.get("status");
        if (statusStr != null) {
            inquiry.setStatus(ContactInquiry.Status.valueOf(statusStr));
            contactInquiryRepository.save(inquiry);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Inquiry status updated successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/contact-inquiries/{id}/reply")
    public ResponseEntity<Map<String, Object>> replyToInquiry(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        ContactInquiry inquiry = contactInquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inquiry not found"));

        String replyMessage = request.get("message");
        if (replyMessage == null || replyMessage.isEmpty()) {
            throw new RuntimeException("Reply message cannot be empty");
        }

        emailService.sendInquiryReplyEmail(inquiry.getEmail(), inquiry.getName(), inquiry.getMessage(), replyMessage);

        inquiry.setStatus(ContactInquiry.Status.replied);
        contactInquiryRepository.save(inquiry);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Reply sent successfully");
        return ResponseEntity.ok(response);
    }
}
