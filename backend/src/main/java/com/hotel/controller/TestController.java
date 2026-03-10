package com.hotel.controller;

import com.hotel.model.User;
import com.hotel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @GetMapping("/auth-info")
    public ResponseEntity<Map<String, Object>> getAuthInfo(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        
        if (authentication == null) {
            response.put("authenticated", false);
            response.put("message", "No authentication found");
        } else {
            response.put("authenticated", true);
            response.put("name", authentication.getName());
            response.put("authorities", authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList()));
            response.put("principal", authentication.getPrincipal().toString());
        }
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/admin-status")
    public ResponseEntity<Map<String, Object>> getAdminStatus() {
        Map<String, Object> response = new HashMap<>();
        String adminEmail = "charunilasithma@gmail.com";
        
        User admin = userRepository.findByEmailIgnoreCase(adminEmail).orElse(null);
        
        if (admin == null) {
            response.put("exists", false);
            response.put("message", "Admin account not found");
        } else {
            response.put("exists", true);
            response.put("email", admin.getEmail());
            response.put("role", admin.getRole().name());
            response.put("emailVerified", admin.getEmailVerified());
            response.put("isActive", admin.getIsActive());
            response.put("name", admin.getName());
            
            // Test password match
            boolean passwordMatches = passwordEncoder.matches("123456", admin.getPassword());
            response.put("passwordMatches", passwordMatches);
            response.put("message", passwordMatches ? "Admin account is properly configured" : "Admin password needs to be reset");
        }
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/reset-admin-password")
    public ResponseEntity<Map<String, Object>> resetAdminPassword() {
        Map<String, Object> response = new HashMap<>();
        String adminEmail = "charunilasithma@gmail.com";
        
        User admin = userRepository.findByEmailIgnoreCase(adminEmail).orElse(null);
        
        if (admin == null) {
            response.put("success", false);
            response.put("message", "Admin account not found");
            return ResponseEntity.ok(response);
        }
        
        // Reset password to 123456
        admin.setPassword(passwordEncoder.encode("123456"));
        admin.setEmailVerified(true);
        admin.setIsActive(true);
        admin.setRole(User.Role.admin);
        userRepository.save(admin);
        
        response.put("success", true);
        response.put("message", "Admin password reset to 123456");
        response.put("email", admin.getEmail());
        
        return ResponseEntity.ok(response);
    }
}

