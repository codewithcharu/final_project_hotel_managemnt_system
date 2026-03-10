package com.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private boolean success;
    private String message;
    private AuthData data;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthData {
        private String token;
        private UserData user;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserData {
        private Long id;
        private String name;
        private String email;
        private String role;
        private String nic;
        private String phoneNumber;
        private String address;
    }
}
