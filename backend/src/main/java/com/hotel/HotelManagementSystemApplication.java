package com.hotel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
@org.springframework.scheduling.annotation.EnableAsync
public class HotelManagementSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(HotelManagementSystemApplication.class, args);
    }
}
