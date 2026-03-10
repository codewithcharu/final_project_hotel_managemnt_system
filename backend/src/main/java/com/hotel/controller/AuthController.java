package com.hotel.controller;

import com.hotel.dto.AuthRequest;
import com.hotel.dto.AuthResponse;
import com.hotel.dto.RegisterRequest;
import com.hotel.security.JwtUtil;
import com.hotel.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        Map<String, Object> mapResponse = new HashMap<>();
        mapResponse.put("success", response.isSuccess());
        mapResponse.put("message", response.getMessage());
        if (response.getData() != null) {
            mapResponse.put("data", response.getData());
        }
        return ResponseEntity.ok(mapResponse);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        AuthResponse response = authService.verifyOtp(email, otp);
        Map<String, Object> mapResponse = new HashMap<>();
        mapResponse.put("success", response.isSuccess());
        mapResponse.put("message", response.getMessage());
        return ResponseEntity.ok(mapResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.login(request);
            Map<String, Object> mapResponse = new HashMap<>();
            mapResponse.put("success", response.isSuccess());
            mapResponse.put("message", response.getMessage());
            if (response.getData() != null) {
                Map<String, Object> data = new HashMap<>();
                data.put("token", response.getData().getToken());
                if (response.getData().getUser() != null) {
                    Map<String, Object> user = new HashMap<>();
                    user.put("id", response.getData().getUser().getId());
                    user.put("name", response.getData().getUser().getName());
                    user.put("email", response.getData().getUser().getEmail());
                    user.put("role", response.getData().getUser().getRole());
                    user.put("nic", response.getData().getUser().getNic());
                    user.put("phoneNumber", response.getData().getUser().getPhoneNumber());
                    user.put("address", response.getData().getUser().getAddress());
                    data.put("user", user);
                }
                mapResponse.put("data", data);
            }
            return ResponseEntity.ok(mapResponse);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        AuthResponse.UserData userData = authService.getCurrentUser(email);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        Map<String, Object> data = new HashMap<>();
        data.put("id", userData.getId());
        data.put("name", userData.getName());
        data.put("email", userData.getEmail());
        data.put("role", userData.getRole());
        data.put("nic", userData.getNic());
        data.put("phoneNumber", userData.getPhoneNumber());
        data.put("address", userData.getAddress());
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update-profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        String email = authentication.getName();
        String name = request.get("name");
        String nic = request.get("nic");
        String phoneNumber = request.get("phoneNumber");
        String address = request.get("address");

        AuthResponse.UserData userData = authService.updateProfile(email, name, nic, phoneNumber, address);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Profile updated successfully");

        Map<String, Object> data = new HashMap<>();
        data.put("id", userData.getId());
        data.put("name", userData.getName());
        data.put("email", userData.getEmail());
        data.put("role", userData.getRole());
        data.put("nic", userData.getNic());
        data.put("phoneNumber", userData.getPhoneNumber());
        data.put("address", userData.getAddress());
        response.put("data", data);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        String email = authentication.getName();
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        authService.changePassword(email, currentPassword, newPassword);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Password updated successfully");
        return ResponseEntity.ok(response);
    }
}
