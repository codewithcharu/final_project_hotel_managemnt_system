package com.hotel.controller;

import com.hotel.model.ContactInquiry;
import com.hotel.repository.ContactInquiryRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactController {
    
    @Autowired
    private ContactInquiryRepository contactInquiryRepository;
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> submitInquiry(@Valid @RequestBody Map<String, String> request) {
        ContactInquiry inquiry = new ContactInquiry();
        inquiry.setName(request.get("name"));
        inquiry.setEmail(request.get("email"));
        inquiry.setPhone(request.get("phone"));
        inquiry.setSubject(request.get("subject"));
        inquiry.setMessage(request.get("message"));
        inquiry.setInquiryType(request.getOrDefault("inquiryType", "general"));
        
        contactInquiryRepository.save(inquiry);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Thank you for your inquiry. We will get back to you soon.");
        return ResponseEntity.ok(response);
    }
}

