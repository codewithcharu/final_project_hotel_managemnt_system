package com.hotel.controller;

// Add these imports to existing AdminController.java imports
import com.hotel.model.RoomReservation;
import com.hotel.model.DiningReservation;
import com.hotel.model.EventPlan;
import com.hotel.repository.RoomReservationRepository;
import com.hotel.repository.DiningReservationRepository;
import com.hotel.repository.EventPlanRepository;

/**
 * ADD THESE ENDPOINTS TO AdminController.java
 * 
 * Place these methods in the AdminController class
 */

// GET ALL ROOM RESERVATIONS
@GetMapping("/room-reservations")public ResponseEntity<Map<String,Object>>getAllRoomReservations(){try{List<RoomReservation>reservations=roomReservationRepository.findAll();

Map<String,Object>response=new HashMap<>();response.put("success",true);response.put("data",reservations);

return ResponseEntity.ok(response);}catch(Exception e){Map<String,Object>response=new HashMap<>();response.put("success",false);response.put("message",e.getMessage());return ResponseEntity.status(500).body(response);}}

// UPDATE ROOM RESERVATION STATUS (Approve/Cancel)
@PutMapping("/room-reservations/{id}/status")public ResponseEntity<Map<String,Object>>updateRoomReservationStatus(@PathVariable Long id,@RequestBody Map<String,String>request){try{RoomReservation reservation=roomReservationRepository.findById(id).orElseThrow(()->new RuntimeException("Reservation not found"));

String newStatus=request.get("status");reservation.setStatus(RoomReservation.Status.valueOf(newStatus));roomReservationRepository.save(reservation);

// Send email notification
String details=String.format("Room Type: %s%nCheck-in: %s%nCheck-out: %s%nGuest: %s%nTotal: Rs. %.2f",reservation.getRoomType(),reservation.getCheckInDate(),reservation.getCheckOutDate(),reservation.getGuestName(),reservation.getTotalPrice());

if("approved".equals(newStatus)){emailService.sendReservationApprovedEmail(reservation.getGuestEmail(),reservation.getGuestName(),"Room",details);}else if("cancelled".equals(newStatus)){String reason=request.getOrDefault("reason","Unable to fulfill reservation at this time");emailService.sendReservationCancelledEmail(reservation.getGuestEmail(),reservation.getGuestName(),"Room",details,reason);}

Map<String,Object>response=new HashMap<>();response.put("success",true);response.put("message","Reservation status updated successfully");response.put("data",reservation);

return ResponseEntity.ok(response);}catch(Exception e){Map<String,Object>response=new HashMap<>();response.put("success",false);response.put("message",e.getMessage());return ResponseEntity.status(500).body(response);}}

// UPDATE ROOM RESERVATION DETAILS
@PutMapping("/room-reservations/{id}")public ResponseEntity<Map<String,Object>>updateRoomReservation(@PathVariable Long id,@RequestBody Map<String,Object>request){try{RoomReservation reservation=roomReservationRepository.findById(id).orElseThrow(()->new RuntimeException("Reservation not found"));

// Update fields
if(request.containsKey("roomType"))reservation.setRoomType((String)request.get("roomType"));if(request.containsKey("checkInDate"))reservation.setCheckInDate(LocalDate.parse((String)request.get("checkInDate")));if(request.containsKey("checkOutDate"))reservation.setCheckOutDate(LocalDate.parse((String)request.get("checkOutDate")));if(request.containsKey("guestName"))reservation.setGuestName((String)request.get("guestName"));if(request.containsKey("guestEmail"))reservation.setGuestEmail((String)request.get("guestEmail"));if(request.containsKey("guestPhone"))reservation.setGuestPhone((String)request.get("guestPhone"));if(request.containsKey("totalPrice"))reservation.setTotalPrice(((Number)request.get("totalPrice")).doubleValue());

roomReservationRepository.save(reservation);

// Send update email
String details=String.format("Room Type: %s%nCheck-in: %s%nCheck-out: %s%nGuest: %s",reservation.getRoomType(),reservation.getCheckInDate(),reservation.getCheckOutDate(),reservation.getGuestName());

emailService.sendReservationUpdatedEmail(reservation.getGuestEmail(),reservation.getGuestName(),"Room","",details);

Map<String,Object>response=new HashMap<>();response.put("success",true);response.put("message","Reservation updated successfully");response.put("data",reservation);

return ResponseEntity.ok(response);}catch(Exception e){Map<String,Object>response=new HashMap<>();response.put("success",false);response.put("message",e.getMessage());return ResponseEntity.status(500).body(response);}}

// GET ALL DINING RESERVATIONS
@GetMapping("/dining-reservations")public ResponseEntity<Map<String,Object>>getAllDiningReservations(){try{List<DiningReservation>reservations=diningReservationRepository.findAll();

Map<String,Object>response=new HashMap<>();response.put("success",true);response.put("data",reservations);

return ResponseEntity.ok(response);}catch(Exception e){Map<String,Object>response=new HashMap<>();response.put("success",false);response.put("message",e.getMessage());return ResponseEntity.status(500).body(response);}}

// UPDATE DINING RESERVATION STATUS
@PutMapping("/dining-reservations/{id}/status")public ResponseEntity<Map<String,Object>>updateDiningReservationStatus(@PathVariable Long id,@RequestBody Map<String,String>request){try{DiningReservation reservation=diningReservationRepository.findById(id).orElseThrow(()->new RuntimeException("Reservation not found"));

String newStatus=request.get("status");reservation.setStatus(DiningReservation.Status.valueOf(newStatus));diningReservationRepository.save(reservation);

// Send email notification
String details=String.format("Occasion: %s%nDate: %s%nTime: %s%nGuests: %d%nName: %s",reservation.getOccasion()!=null?reservation.getOccasion():"Dining",reservation.getReservationDate(),reservation.getReservationTime(),reservation.getGuestCount(),reservation.getGuestName());

if("confirmed".equals(newStatus)||"approved".equals(newStatus)){emailService.sendReservationApprovedEmail(reservation.getGuestEmail(),reservation.getGuestName(),"Dining",details);}else if("cancelled".equals(newStatus)){String reason=request.getOrDefault("reason","Unable to accommodate your reservation");emailService.sendReservationCancelledEmail(reservation.getGuestEmail(),reservation.getGuestName(),"Dining",details,reason);}

Map<String,Object>response=new HashMap<>();response.put("success",true);response.put("message","Dining reservation status updated successfully");response.put("data",reservation);

return ResponseEntity.ok(response);}catch(Exception e){Map<String,Object>response=new HashMap<>();response.put("success",false);response.put("message",e.getMessage());return ResponseEntity.status(500).body(response);}}

// GET ALL EVENT PLANS
@GetMapping("/event-plans")public ResponseEntity<Map<String,Object>>getAllEventPlans(){try{List<EventPlan>events=eventPlanRepository.findAll();

Map<String,Object>response=new HashMap<>();response.put("success",true);response.put("data",events);

return ResponseEntity.ok(response);}catch(Exception e){Map<String,Object>response=new HashMap<>();response.put("success",false);response.put("message",e.getMessage());return ResponseEntity.status(500).body(response);}}

// UPDATE EVENT PLAN STATUS
@PutMapping("/event-plans/{id}/status")public ResponseEntity<Map<String,Object>>updateEventPlanStatus(@PathVariable Long id,@RequestBody Map<String,String>request){try{EventPlan event=eventPlanRepository.findById(id).orElseThrow(()->new RuntimeException("Event plan not found"));

String newStatus=request.get("status");event.setStatus(EventPlan.Status.valueOf(newStatus));eventPlanRepository.save(event);

// Send email notification
String details=String.format("Event Type: %s%nDate: %s%nVenue: %s%nGuests: %d%nName: %s",event.getEventType(),event.getEventDate(),event.getVenue()!=null?event.getVenue():"TBD",event.getGuestCount(),event.getGuestName());

if("approved".equals(newStatus)){emailService.sendReservationApprovedEmail(event.getGuestEmail(),event.getGuestName(),"Event",details);}else if("cancelled".equals(newStatus)){String reason=request.getOrDefault("reason","Unable to host your event");emailService.sendReservationCancelledEmail(event.getGuestEmail(),event.getGuestName(),"Event",details,reason);}

Map<String,Object>response=new HashMap<>();response.put("success",true);response.put("message","Event plan status updated successfully");response.put("data",event);

return ResponseEntity.ok(response);}catch(Exception e){Map<String,Object>response=new HashMap<>();response.put("success",false);response.put("message",e.getMessage());return ResponseEntity.status(500).body(response);}}
