-- Fix image_url column size for room_types, dining_types, and event_types tables
-- This ensures the columns can handle large base64 encoded images
-- IMPORTANT: Run this script in MySQL Workbench to fix the error

USE hotel_management_system;

-- Update room_types table
-- This changes image_url from TEXT (65KB limit) to LONGTEXT (4GB limit)
ALTER TABLE room_types 
MODIFY COLUMN image_url LONGTEXT;

-- Update dining_types table for consistency
ALTER TABLE dining_types 
MODIFY COLUMN image_url LONGTEXT;

-- Update event_types table (add image_url column if it doesn't exist, or modify if it does)
ALTER TABLE event_types 
MODIFY COLUMN image_url LONGTEXT;

-- Verify the changes
DESCRIBE room_types;
DESCRIBE dining_types;
DESCRIBE event_types;
