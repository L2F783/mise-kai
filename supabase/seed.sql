-- MiseKai Seed Data
-- Version: 1.0.0
-- Created: 2026-02-01
--
-- USAGE:
-- 1. First, create your PM account via the sign-up flow at /auth/sign-up
-- 2. Get your user ID from the Supabase dashboard (Authentication > Users)
-- 3. Replace 'YOUR_USER_ID_HERE' with your actual user ID
-- 4. Run this script in the Supabase SQL editor
--
-- This script promotes an existing user to PM role.

-- Promote user to PM role
-- Replace the email address with your PM's email
UPDATE profiles
SET role = 'pm'
WHERE email = 'YOUR_PM_EMAIL_HERE';

-- Alternatively, if you know the user ID:
-- UPDATE profiles
-- SET role = 'pm'
-- WHERE id = 'YOUR_USER_ID_HERE';

-- Verify the update
SELECT id, email, full_name, role, status
FROM profiles
WHERE role = 'pm';
