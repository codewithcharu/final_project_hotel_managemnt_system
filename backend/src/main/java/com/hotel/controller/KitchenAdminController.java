package com.hotel.controller;

import com.hotel.model.*;
import com.hotel.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/kitchen-admin")
@CrossOrigin(origins = "*")
public class KitchenAdminController {

        @Autowired
        private DiningReservationRepository diningReservationRepository;

        @Autowired
        private InventoryRepository inventoryRepository;

        @GetMapping("/orders")
        public ResponseEntity<Map<String, Object>> getKitchenOrders(@RequestParam(required = false) String status) {
                List<DiningReservation> orders = diningReservationRepository.findAll();

                if (status != null && !status.isEmpty()) {
                        orders = orders.stream()
                                        .filter(o -> o.getOrderStatus().name().equalsIgnoreCase(status))
                                        .collect(Collectors.toList());
                }


                orders.sort((o1, o2) -> {
                        int dateComp = o2.getReservationDate().compareTo(o1.getReservationDate());
                        if (dateComp != 0)
                                return dateComp;
                        return o2.getReservationTime().compareTo(o1.getReservationTime());
                });

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", orders);
                return ResponseEntity.ok(response);
        }

        @PutMapping("/orders/{id}/status")
        public ResponseEntity<Map<String, Object>> updateOrderStatus(
                        @PathVariable Long id,
                        @RequestBody Map<String, String> request) {
                DiningReservation order = diningReservationRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                try {
                        order.setOrderStatus(DiningReservation.OrderStatus.valueOf(request.get("order_status")));
                        diningReservationRepository.save(order);

                        Map<String, Object> response = new HashMap<>();
                        response.put("success", true);
                        response.put("message", "Order status updated successfully");
                        return ResponseEntity.ok(response);
                } catch (IllegalArgumentException e) {
                        throw new RuntimeException("Invalid order status");
                }
        }

        // Inventory Management
        @GetMapping("/inventory")
        public ResponseEntity<Map<String, Object>> getInventory(@RequestParam(required = false) String type) {
                try {
                        List<Inventory> inventoryList = inventoryRepository.findAll();

                        if (type != null && !type.isEmpty()) {
                                // Category filtering removed as InventoryCategory is no longer used
                        }

                        Map<String, Object> response = new HashMap<>();
                        response.put("success", true);
                        response.put("data", inventoryList);
                        return ResponseEntity.ok(response);
                } catch (Exception e) {
                        Map<String, Object> response = new HashMap<>();
                        response.put("success", false);
                        response.put("message", "Error fetching inventory: " + e.getMessage());
                        return ResponseEntity.status(500).body(response);
                }
        }

        @PutMapping("/inventory/{id}")
        public ResponseEntity<Map<String, Object>> updateInventory(
                        @PathVariable Long id,
                        @RequestBody Map<String, Object> request) {
                Inventory inventory = inventoryRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Inventory item not found"));

                if (request.containsKey("quantity"))
                        inventory.setQuantity(((Number) request.get("quantity")).intValue());

                if (request.containsKey("min_stock_level"))
                        inventory.setMinStockLevel(((Number) request.get("min_stock_level")).intValue());

                // Allow updating last restocked date
                if (request.containsKey("update_restock_date") && (Boolean) request.get("update_restock_date")) {
                        inventory.setLastRestocked(java.time.LocalDate.now());
                }

                inventoryRepository.save(inventory);

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Inventory updated successfully");
                return ResponseEntity.ok(response);
        }
}
