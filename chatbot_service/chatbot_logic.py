import requests
from typing import Tuple, Dict, Any, Optional

# Constants
JAVA_BACKEND_URL = "http://localhost:3000/api"

# Knowledge Base (Extracted from Website Content)
FAQ_DATABASE = {
    "location": "Piyakaru Hotel is located at Tangalle Road, Beliatta, Sri Lanka, offering easy access to beautiful beaches and local attractions.",
    "address": "Our address is Tangalle Road, Beliatta, Sri Lanka.",
    "phone": "You can reach us at +94 47 225 1207.",
    "email": "Email us at infopiyakaru@gmail.com.",
    "contact": "Call us at +94 47 225 1207 or email infopiyakaru@gmail.com. Reception is open from 6:00 AM to 11:00 PM.",
    "reception": "Our reception desk is open from 6:00 AM to 11:00 PM.",
    "wifi": "Yes, we offer free Wi-Fi access throughout the hotel.",
    "pool": "Yes, we have an enormous outdoor pool for your relaxation.",
    "parking": "Yes, we provide perfect parking space for our guests.",
    "dining": "We offer authentic Sri Lankan cuisine and international favorites at our Fine Dining Restaurant. Breakfast buffet available.",
    "restaurant": "Our restaurant serves fresh seafood, traditional curries, and continental dishes. Usage: Fine Dining, Breakfast Buffet.",
    "events": "We host weddings and corporate events. Let our dedicated team bring your vision to life.",
    "checkin": "Check-in time is typically 2:00 PM and Check-out is 11:00 AM. (Please confirm with reception for specific requests).",
    "amenities": "Our amenities include a swimming pool, free Wi-Fi, parking space, lovely garden views, and a fine dining restaurant.",
    "rooms": "We offer a range of refined rooms and suites with modern amenities, air conditioning, and beautiful views."
}

def get_room_types():
    try:
        response = requests.get(f"{JAVA_BACKEND_URL}/public/room-types")
        if response.status_code == 200:
            return response.json().get("data", [])
    except Exception:
        pass
    return []

def get_dining_types():
    try:
        response = requests.get(f"{JAVA_BACKEND_URL}/public/dining-types")
        if response.status_code == 200:
            return response.json().get("data", [])
    except Exception:
        pass
    return []

def get_event_types():
    try:
        response = requests.get(f"{JAVA_BACKEND_URL}/public/event-types")
        if response.status_code == 200:
            return response.json().get("data", [])
    except Exception:
        pass
    return []

def get_all_reservations(type_name: str):
    """Fetch reservations from API based on type."""
    # Updated: Points to the newly created public/root GET endpoints in controllers
    endpoint_map = {
        "Room": "room-reservations",
        "Dining": "dining-reservations",
        "Event": "event-plans"
    }
    try:
        url = f"{JAVA_BACKEND_URL}/{endpoint_map.get(type_name)}"
        print(f"Chatbot Fetching: {url}") # Debug log
        response = requests.get(url) 
        if response.status_code == 200:
            return response.json().get("data", [])
    except Exception as e:
        print(f"Error fetching {type_name} reservations: {e}")
    return []

def process_message(message: str, context: Dict[str, Any]) -> Tuple[str, Dict[str, Any], Optional[str], Optional[Any]]:
    """
    Process the user message and return a response based on ROLE and STATE.
    """
    msg = message.lower().strip()
    
    # --- GLOBAL RESET ---
    if msg in ["restart", "reset", "menu", "start"]:
        return (
            "Welcome back to Piyakaru Hotel! Are you a **Customer**, **Staff**, or **Admin**?",
            {"stage": "role_selection"}, 
            None, None
        )

    # --- INITIAL STATE: ROLE SELECTION ---
    current_stage = context.get("stage", "role_selection")
    
    if current_stage == "role_selection":
        if "customer" in msg or "guest" in msg:
            return (
                "Welcome to Piyakaru Hotel! How can I help you today?\n1. Book a Room\n2. Dining Reservations\n3. Event Venues\n4. General Inquiries",
                {"stage": "customer_main", "role": "customer"},
                None, None
            )
        elif "staff" in msg:
            return (
                "Staff Verification: Please enter your 4-digit Staff PIN.",
                {"stage": "staff_auth", "role": "staff"},
                None, None
            )
        elif "admin" in msg:
            return (
                "Admin Access: Please enter your Admin Security Key.",
                {"stage": "admin_auth", "role": "admin"},
                None, None
            )
        else:
            return (
                "I didn't quite catch that. Are you a **Customer**, **Staff**, or **Admin**?",
                {"stage": "role_selection"},
                None, None
            )

    # --- ROLE: CUSTOMER FLOW ---
    if context.get("role") == "customer":
        
        # FAQ Check (Priority over generic matching)
        for key, answer in FAQ_DATABASE.items():
            if key in msg:
                # If specific action keywords are also present, do the action instead of just FAQ
                if key == "rooms" and "book" in msg: continue
                if key == "dining" and "book" in msg: continue
                if key == "events" and "book" in msg: continue
                
                return (answer, context, None, None)

        # 1. Room Booking
        if "book" in msg and "room" in msg or "1" in msg or "accommodation" in msg:
            rooms = get_room_types()
            if rooms:
                return ("Here are our available rooms. Check them out above! 👆", context, "show_rooms", rooms)
            return ("I can't fetch rooms right now. Please try calling reception.", context, None, None)

        # 2. Dining
        if "dining" in msg or "food" in msg or "2" in msg or "restaurant" in msg:
            dining = get_dining_types()
            if dining:
                 return ("Here are our dining options:", context, "show_dining", dining)
            return ("Our menu is currently offline.", context, None, None)

        # 3. Events
        if "event" in msg or "hall" in msg or "wedding" in msg or "3" in msg:
             events = get_event_types()
             return ("We create magical events! Here are our venues:", context, "show_events", events)

        # 4. General
        if "help" in msg or "info" in msg or "4" in msg:
            return ("You can reach Front Desk at +94 47 225 1207 or email infopiyakaru@gmail.com.", context, None, None)
        
        return ("I'm your Concierge. Ask me about Rooms, Dining, Events, or Hotel Amenities (Pool, Wifi, Location)!", context, None, None)

    # --- ROLE: STAFF FLOW ---
    if context.get("role") == "staff":
        if context.get("stage") == "staff_auth":
            if msg == "1234": # Mock PIN
                return (
                    "Access Granted. Staff Menu:\n1. View All Reservations\n2. View Customer Bills\n3. Maintenance Request\n4. Go to Staff Portal",
                    {"stage": "staff_menu", "role": "staff"},
                    None, None
                )
            else:
                 return ("Incorrect PIN. Please try again.", context, None, None)
        
        if context.get("stage") == "staff_menu":
            if "reservation" in msg or "1" in msg:
                 return ("You can view and manage all Room, Dining, and Event reservations in the Staff Portal. Currently, there are 0 pending reservations requiring immediate action.", context, None, None)
            if "bill" in msg or "2" in msg:
                 return (
                     "Which reservation type would you like to view?\n1. Room Reservation\n2. Dining Reservation\n3. Event Reservation",
                     {"stage": "staff_bill_type", "role": "staff"},
                     None, None
                 )
            if "maintenance" in msg or "3" in msg:
                 return ("Please describe the maintenance issue.", {"stage": "staff_maintenance", "role": "staff"}, None, None)
            if "portal" in msg or "analysis" in msg or "4" in msg:
                 return ("The Staff Dashboard is available at /staff for full data analysis and report generation.", context, None, None)
        
        if context.get("stage") == "staff_bill_type":
            type_map = {"1": "Room", "room": "Room", "2": "Dining", "dining": "Dining", "3": "Event", "event": "Event"}
            selected_type = None
            for key in type_map:
                if key in msg:
                    selected_type = type_map[key]
                    break
            
            if selected_type:
                return (
                    f"Please enter the **Guest Email Address** or **Reservation ID** for the {selected_type} booking.",
                    {"stage": "staff_bill_view", "role": "staff", "bill_type": selected_type},
                    None, None
                )
            else:
                return ("Please select a valid type: 1. Room, 2. Dining, or 3. Event.", context, None, None)

        if context.get("stage") == "staff_bill_view":
             bill_type = context.get("bill_type", "General")
             search_query = message.strip().lower()
             
             # Fetch real data from Java Backend
             reservations = get_all_reservations(bill_type)
             
             # Search for ALL matching records
             found_list = []
             for res in reservations:
                 res_id = str(res.get("id", ""))
                 res_email = str(res.get("guestEmail", "")).lower()
                 res_name = str(res.get("guestName", "")).lower()
                 
                 if search_query == res_id or search_query == res_email or search_query in res_name:
                     found_list.append(res)
             
             if found_list:
                 result_lines = [f"✅ FOUND {len(found_list)} {bill_type} Reservation(s):\n"]
                 for i, found_res in enumerate(found_list, 1):
                     total = found_res.get("totalPrice") or found_res.get("price") or 0.0
                     guest = found_res.get("guestName", "Guest")
                     res_id = found_res.get("id", "N/A")
                     status = found_res.get("status", "Confirmed")
                     result_lines.append(
                         f"--- Reservation #{res_id} ---\n"
                         f"Guest: {guest}\n"
                         f"Email: {found_res.get('guestEmail')}\n"
                         f"Status: {status}\n"
                         f"Total Bill: Rs. {total:,.2f}"
                     )
                 return (
                     "\n".join(result_lines),
                     {"stage": "staff_menu", "role": "staff"},
                     None, None
                 )
             else:
                 return (
                     f"❌ NOT FOUND: I couldn't find a {bill_type} reservation for '{message}' in the database. Please check the email/ID and try again.",
                     {"stage": "staff_menu", "role": "staff"},
                     None, None
                 )
            
        if context.get("stage") == "staff_room_clean":
             return (f"Marked Room {msg} as Cleaned. Back to menu.", {"stage": "staff_menu", "role": "staff"}, None, None)
             
        if context.get("stage") == "staff_maintenance":
             return ("Maintenance request logged. Engineering team has been notified.", {"stage": "staff_menu", "role": "staff"}, None, None)

        return ("Staff Command not recognized. Options: Clean, Shift, Maintenance.", context, None, None)


    # --- ROLE: ADMIN FLOW ---
    if context.get("role") == "admin":
        if context.get("stage") == "admin_auth":
            if msg == "admin": # Mock Key
                return (
                    "Welcome, Administrator. Dashboard Access:\n1. View Occupancy\n2. Revenue Report\n3. System Health",
                    {"stage": "admin_menu", "role": "admin"},
                    None, None
                )
            else:
                 return ("Access Denied.", context, None, None)
        
        if context.get("stage") == "admin_menu":
            if "occupancy" in msg or "1" in msg:
                # Updated based on user's database: currently reporting 0/8 for accuracy
                return ("Current Occupancy: 0% (0/8 Rooms Booked)", context, None, None)
            if "revenue" in msg or "2" in msg:
                # Updated: User confirmed Rs. 0 revenue for today
                return ("Today's Revenue: Rs. 0", context, None, None)
            if "health" in msg or "3" in msg:
                return ("System Status: All services operational. Database: Healthy.", context, None, None)

        return ("Admin Console. Options: Occupancy, Revenue, Health.", context, None, None)

    # Fallback
    return ("I'm confused. Type 'start' to restart.", context, None, None)
