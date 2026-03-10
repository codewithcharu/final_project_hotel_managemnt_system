package com.hotel.service;

import com.hotel.dto.AuthRequest;
import com.hotel.dto.AuthResponse;
import com.hotel.dto.RegisterRequest;
import com.hotel.model.User;
import com.hotel.repository.UserRepository;
import com.hotel.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    public AuthResponse register(RegisterRequest request) {
        // Normalize email: trim whitespace and convert to lowercase
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        // Check if email exists (case-insensitive)
        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }
        if (userRepository.existsByNic(request.getNic())) {
            throw new RuntimeException("User with this NIC already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setNic(request.getNic());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setRole(User.Role.customer);
        user.setEmailVerified(false);
        user.setIsActive(true);

        // Generate OTP
        String otp = generateOTP();
        user.setOtp(otp);
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(10));

        userRepository.save(user);

        // Send OTP email
        try {
            emailService.sendOTPEmail(user.getEmail(), otp);
        } catch (Exception e) {
            // Email failed but registration succeeded
            System.err.println("Failed to send OTP email: " + e.getMessage());
        }

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Registration successful. Please check your email for OTP verification.");
        AuthResponse.AuthData authData = new AuthResponse.AuthData();
        authData.setUser(new AuthResponse.UserData());
        authData.getUser().setId(user.getId());
        response.setData(authData);
        return response;
    }

    public AuthResponse verifyOtp(String email, String otp) {
        String normalizedEmail = email.trim();
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }

        if (!otp.equals(user.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        user.setEmailVerified(true);
        user.setOtp(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Email verified successfully");
        return response;
    }

    public AuthResponse login(AuthRequest request) {
        // Normalize email: trim whitespace
        String normalizedEmail = request.getEmail().trim();

        System.out.println("Login attempt for email: " + normalizedEmail);

        // Use case-insensitive lookup
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> {
                    System.out.println("User not found with email: " + normalizedEmail);
                    return new RuntimeException("Invalid email or password");
                });

        System.out.println("User found: " + user.getEmail() + ", Role: " + user.getRole() +
                ", Verified: " + user.getEmailVerified() + ", Active: " + user.getIsActive());

        if (!user.getEmailVerified()) {
            System.out.println("Login failed: Email not verified");
            throw new RuntimeException("Please verify your email before logging in");
        }

        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        System.out.println("Password match: " + passwordMatches);

        if (!passwordMatches) {
            System.out.println("Login failed: Password mismatch");
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.getIsActive()) {
            System.out.println("Login failed: Account disabled");
            throw new RuntimeException("Account is disabled");
        }

        System.out.println("Login successful for: " + user.getEmail());

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        AuthResponse.AuthData authData = new AuthResponse.AuthData();
        authData.setToken(token);

        AuthResponse.UserData userData = new AuthResponse.UserData();
        userData.setId(user.getId());
        userData.setName(user.getName());
        userData.setEmail(user.getEmail());
        userData.setRole(user.getRole().name());
        userData.setNic(user.getNic());
        userData.setPhoneNumber(user.getPhoneNumber());
        userData.setAddress(user.getAddress());
        authData.setUser(userData);

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Login successful");
        response.setData(authData);
        return response;
    }

    public AuthResponse.UserData getCurrentUser(String email) {
        String normalizedEmail = email.trim();
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        AuthResponse.UserData userData = new AuthResponse.UserData();
        userData.setId(user.getId());
        userData.setName(user.getName());
        userData.setEmail(user.getEmail());
        userData.setRole(user.getRole().name());
        userData.setNic(user.getNic());
        userData.setPhoneNumber(user.getPhoneNumber());
        userData.setAddress(user.getAddress());
        return userData;
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        String normalizedEmail = email.trim();
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public AuthResponse.UserData updateProfile(String email, String name, String nic, String phoneNumber,
            String address) {
        String normalizedEmail = email.trim();
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (name != null && !name.isEmpty())
            user.setName(name);

        if (nic != null && !nic.isEmpty() && !nic.equals(user.getNic())) {
            if (userRepository.existsByNic(nic)) {
                throw new RuntimeException("User with this NIC already exists");
            }
            user.setNic(nic);
        } else if (nic != null && !nic.isEmpty()) {
            // Same NIC, ensure it's set (redundant but safe)
        }

        if (phoneNumber != null)
            user.setPhoneNumber(phoneNumber);
        if (address != null)
            user.setAddress(address);

        userRepository.save(user);

        AuthResponse.UserData userData = new AuthResponse.UserData();
        userData.setId(user.getId());
        userData.setName(user.getName());
        userData.setEmail(user.getEmail());
        userData.setRole(user.getRole().name());
        userData.setNic(user.getNic());
        userData.setPhoneNumber(user.getPhoneNumber());
        userData.setAddress(user.getAddress());
        return userData;
    }

    private String generateOTP() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(999999));
    }
}
