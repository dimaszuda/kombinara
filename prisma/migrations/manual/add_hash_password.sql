-- Add hash_password column to users table for storing bcrypt hash of user password
ALTER TABLE users ADD COLUMN IF NOT EXISTS hash_password TEXT;
