package com.hotel.config;

import com.hotel.model.User;
import com.hotel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Create default admin account if it doesn't exist
        // Normalize email to lowercase
        String adminEmail = "charunilasithma@gmail.com".toLowerCase().trim();
        
        // Use case-insensitive lookup
        User admin = userRepository.findByEmailIgnoreCase(adminEmail).orElse(null);
        
        if (admin == null) {
            // Create new admin account
            admin = new User();
            admin.setName("System Admin");
            admin.setNic("ADMIN001");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("123456"));
            admin.setRole(User.Role.admin);
            admin.setEmailVerified(true);
            admin.setIsActive(true);
            userRepository.save(admin);
            System.out.println("✓ Default admin account created: " + adminEmail + " / Password: 123456");
        } else {
            // Always update admin to ensure correct settings
            admin.setPassword(passwordEncoder.encode("123456")); // Reset password to default
            admin.setEmailVerified(true);
            admin.setIsActive(true);
            admin.setRole(User.Role.admin);
            userRepository.save(admin);
            System.out.println("✓ Admin account updated: " + adminEmail + " / Password: 123456");
        }
    }
}

