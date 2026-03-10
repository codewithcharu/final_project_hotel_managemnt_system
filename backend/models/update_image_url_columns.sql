-- Migration script to update image_url columns to TEXT type
-- Run this script in MySQL Workbench to fix the "Data too long" error

USE hotel_management_system;

-- Update room_types table
ALTER TABLE room_types MODIFY COLUMN image_url TEXT;

-- Update dining_types table (if it exists)
ALTER TABLE dining_types MODIFY COLUMN image_url TEXT;

-- Verify the changes
DESCRIBE room_types;
DESCRIBE dining_types;

