-- Create database
CREATE DATABASE IF NOT EXISTS hotel_management_system;
USE hotel_management_system;

-- Users table (updated with role)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  nic VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  address TEXT,
  role ENUM('admin', 'customer', 'kitchen_admin', 'staff') DEFAULT 'customer',
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  otp VARCHAR(6),
  otp_expires_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Room types table (managed by Admin)
CREATE TABLE IF NOT EXISTS room_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price_per_night DECIMAL(10, 2) NOT NULL,
  capacity INT NOT NULL DEFAULT 2,
  amenities TEXT,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Dining types table (managed by Admin)
CREATE TABLE IF NOT EXISTS dining_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category ENUM('breakfast', 'lunch', 'dinner', 'beverages', 'snacks') NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Event types table (managed by Admin)
CREATE TABLE IF NOT EXISTS event_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  capacity INT NOT NULL,
  venue_options TEXT,
  image_url LONGTEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Staff table (extended user information for staff)
CREATE TABLE IF NOT EXISTS staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  employee_id VARCHAR(50) UNIQUE,
  department VARCHAR(100),
  position VARCHAR(100),
  hire_date DATE,
  salary DECIMAL(10, 2),
  manager_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Room reservations table (updated with room_type_id)
CREATE TABLE IF NOT EXISTS room_reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  room_type_id INT,
  room_type VARCHAR(255) NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(20),
  total_price DECIMAL(10, 2) NOT NULL,
  addons TEXT,
  status ENUM('pending', 'approved', 'cancelled', 'completed', 'checked_in', 'checked_out') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE SET NULL
);

-- Dining reservations table (updated with dining_type_id and order_status)
CREATE TABLE IF NOT EXISTS dining_reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  dining_type_id INT,
  occasion VARCHAR(255),
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  guest_count INT NOT NULL,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(20),
  special_requests TEXT,
  order_status ENUM('pending', 'preparing', 'completed', 'cancelled') DEFAULT 'pending',
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (dining_type_id) REFERENCES dining_types(id) ON DELETE SET NULL
);

-- Event plans table (updated with event_type_id)
CREATE TABLE IF NOT EXISTS event_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  event_type_id INT,
  event_type VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  venue VARCHAR(255),
  guest_count INT NOT NULL,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(20),
  special_requests TEXT,
  status ENUM('pending', 'approved', 'cancelled', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE SET NULL
);

-- Inventory categories
CREATE TABLE IF NOT EXISTS inventory_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  type ENUM('room', 'kitchen', 'other') NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory items
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INT NOT NULL DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'unit',
  min_stock_level INT DEFAULT 10,
  max_stock_level INT DEFAULT 1000,
  cost_per_unit DECIMAL(10, 2),
  supplier VARCHAR(255),
  last_restocked DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES inventory_categories(id) ON DELETE SET NULL
);

-- Staff leave table
CREATE TABLE IF NOT EXISTS staff_leave (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id INT NOT NULL,
  leave_type ENUM('sick', 'vacation', 'personal', 'emergency') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INT NOT NULL,
  reason TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_by INT,
  approved_at DATETIME,
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Staff attendance table
CREATE TABLE IF NOT EXISTS staff_attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id INT NOT NULL,
  attendance_date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  status ENUM('present', 'absent', 'late', 'half_day') DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_attendance (staff_id, attendance_date)
);

-- Staff salary table
CREATE TABLE IF NOT EXISTS staff_salary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id INT NOT NULL,
  salary_month YEAR(4),
  salary_year INT NOT NULL,
  base_salary DECIMAL(10, 2) NOT NULL,
  days_worked INT DEFAULT 0,
  days_present INT DEFAULT 0,
  days_absent INT DEFAULT 0,
  leave_days INT DEFAULT 0,
  overtime_hours DECIMAL(5, 2) DEFAULT 0,
  overtime_pay DECIMAL(10, 2) DEFAULT 0,
  deductions DECIMAL(10, 2) DEFAULT 0,
  bonuses DECIMAL(10, 2) DEFAULT 0,
  total_salary DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'calculated', 'paid') DEFAULT 'pending',
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_salary (staff_id, salary_month, salary_year)
);

-- Contact inquiries table
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  inquiry_type VARCHAR(50) DEFAULT 'general',
  status ENUM('new', 'read', 'replied') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_nic ON users(nic);
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_room_reservations_user ON room_reservations(user_id);
CREATE INDEX idx_room_reservations_dates ON room_reservations(check_in_date, check_out_date);
CREATE INDEX idx_dining_reservations_user ON dining_reservations(user_id);
CREATE INDEX idx_dining_reservations_order_status ON dining_reservations(order_status);
CREATE INDEX idx_event_plans_user ON event_plans(user_id);
CREATE INDEX idx_staff_leave_staff ON staff_leave(staff_id);
CREATE INDEX idx_staff_leave_status ON staff_leave(status);
CREATE INDEX idx_staff_attendance_staff ON staff_attendance(staff_id);
CREATE INDEX idx_staff_attendance_date ON staff_attendance(attendance_date);
CREATE INDEX idx_staff_salary_staff ON staff_salary(staff_id);
CREATE INDEX idx_inventory_category ON inventory(category_id);

-- Insert default admin user
-- Email: charunilasithma@gmail.com
-- Password: 123456
-- 
-- IMPORTANT: After running this script, run the setup script to properly hash the password:
--   cd backend
--   npm run setup-admin
-- 
-- OR manually generate hash and update this INSERT statement:
--   node scripts/generatePasswordHash.js
--
-- Temporary placeholder hash (will be updated by setup script):
INSERT INTO users (name, nic, email, password, role, email_verified, is_active) 
VALUES ('System Admin', 'ADMIN001', 'charunilasithma@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', TRUE, TRUE)
ON DUPLICATE KEY UPDATE email=email;

-- Insert default inventory categories
INSERT INTO inventory_categories (name, type, description) VALUES
('Room Amenities', 'room', 'Items for room maintenance and guest amenities'),
('Bedding', 'room', 'Bed sheets, pillows, blankets'),
('Bathroom Supplies', 'room', 'Towels, toiletries, cleaning supplies'),
('Kitchen Ingredients', 'kitchen', 'Food ingredients and raw materials'),
('Kitchen Equipment', 'kitchen', 'Cooking utensils and equipment'),
('Office Supplies', 'other', 'Stationery and office materials'),
('Maintenance', 'other', 'Tools and maintenance supplies')
ON DUPLICATE KEY UPDATE name=name;

