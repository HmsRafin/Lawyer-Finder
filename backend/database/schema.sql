-- ============================================================================
-- Lawyer Finder Database Schema (Checkpoint 1)
-- Project: CSE 3104 - Database Systems Lab
-- Tables: users, lawyers, appointments
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `lawyer_finder` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `lawyer_finder`;

-- ----------------------------------------------------------------------------
-- 1. Table: users
-- Stores authentication & role info for clients, lawyers, and admins
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `appointments`;
DROP TABLE IF EXISTS `lawyers`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('client', 'lawyer', 'admin') NOT NULL DEFAULT 'client',
    `phone` VARCHAR(30) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Table: lawyers
-- Stores professional profiles linked 1-to-1 to users with role='lawyer'
-- ----------------------------------------------------------------------------
CREATE TABLE `lawyers` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL UNIQUE,
    `specialization` VARCHAR(100) NOT NULL,
    `district` VARCHAR(80) NOT NULL,
    `bio` TEXT NULL,
    `experience_years` INT UNSIGNED NOT NULL DEFAULT 1,
    `bar_license` VARCHAR(80) NULL,
    `consultation_fee` DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
    `rating` DECIMAL(3,2) NOT NULL DEFAULT 4.80,
    `reviews_count` INT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_lawyers_spec_dist` (`specialization`, `district`),
    CONSTRAINT `fk_lawyers_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Table: appointments
-- Core transactional table with foreign keys to users (client) and lawyers (lawyer)
-- ----------------------------------------------------------------------------
CREATE TABLE `appointments` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `client_id` INT UNSIGNED NOT NULL,
    `lawyer_id` INT UNSIGNED NOT NULL,
    `appointment_date` DATE NOT NULL,
    `appointment_time` TIME NOT NULL,
    `case_description` TEXT NOT NULL,
    `status` ENUM('pending', 'accepted', 'rejected', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    `cancellation_reason` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    -- Composite index to accelerate lawyer schedule lookups & conflict checking
    INDEX `idx_appointments_lawyer_datetime` (`lawyer_id`, `appointment_date`, `appointment_time`),
    INDEX `idx_appointments_client` (`client_id`),
    INDEX `idx_appointments_status` (`status`),
    CONSTRAINT `fk_appointments_client`
        FOREIGN KEY (`client_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_appointments_lawyer`
        FOREIGN KEY (`lawyer_id`) REFERENCES `lawyers` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Sample Seed Data
-- Passwords below are all hashed for 'password123'
-- Hash: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- ============================================================================

-- 1. Insert Users (Admin, Clients, and Lawyers)
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`) VALUES
-- Admin
(1, 'System Admin', 'admin@lawyerfinder.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '+8801700000000'),

-- Clients
(2, 'Sadia Anwar', 'sadia@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', '+8801711111111'),
(3, 'Mahin Hasan', 'mahin@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', '+8801722222222'),
(4, 'Nusrat Tania', 'nusrat@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', '+8801733333333'),
(5, 'Farhan Ahmed', 'farhan@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', '+8801744444444'),

-- Lawyers
(6, 'Adv. Rahim Karim', 'rahim@lawyer.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', '+8801811111111'),
(7, 'Adv. Farzana Yasmin', 'farzana@lawyer.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', '+8801822222222'),
(8, 'Adv. Kamrul Hasan', 'kamrul@lawyer.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', '+8801833333333'),
(9, 'Adv. Nasrin Akter', 'nasrin@lawyer.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', '+8801844444444'),
(10, 'Adv. Shafiul Alam', 'shafiul@lawyer.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', '+8801855555555'),
(11, 'Adv. Tania Rahman', 'tania@lawyer.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', '+8801866666666');

-- 2. Insert Lawyers Profiles
INSERT INTO `lawyers` (`id`, `user_id`, `specialization`, `district`, `bio`, `experience_years`, `bar_license`, `consultation_fee`, `rating`, `reviews_count`) VALUES
(1, 6, 'Corporate', 'Dhaka', 'Senior corporate and commercial lawyer specializing in contract compliance, cross-border M&A, and company registrations.', 9, 'DBA-2019-00417', 2500.00, 4.90, 128),
(2, 7, 'Family', 'Chattogram', 'Expert in family law, child custody mediation, inheritance disputes, and marital property settlements.', 7, 'CBA-2021-00892', 1800.00, 4.80, 96),
(3, 8, 'Criminal', 'Sylhet', 'Dedicated defense attorney focusing on criminal litigation, bail applications, and high-profile appellate hearings.', 12, 'SBA-2016-00129', 3000.00, 4.70, 142),
(4, 9, 'Property', 'Khulna', 'Specialized in real estate title verification, deed registration, and land dispute settlements.', 6, 'KBA-2022-00543', 1500.00, 4.90, 81),
(5, 10, 'Tax', 'Rajshahi', 'Certified tax consultant assisting corporations and individuals with NBR audits and tribunal appeals.', 8, 'RBA-2020-00331', 2000.00, 4.60, 64),
(6, 11, 'Labor', 'Dhaka', 'Advocate for employee rights, workplace regulations, industrial disputes, and severance disputes.', 5, 'DBA-2023-00912', 1400.00, 4.80, 110);

-- 3. Insert Initial Appointments (Real Relations & Various Statuses)
INSERT INTO `appointments` (`id`, `client_id`, `lawyer_id`, `appointment_date`, `appointment_time`, `case_description`, `status`, `cancellation_reason`) VALUES
(1, 2, 1, '2026-08-20', '10:30:00', 'Need consultation for cross-border software licensing agreement and VAT compliance.', 'pending', NULL),
(2, 3, 1, '2026-08-22', '14:30:00', 'Shareholders agreement drafting and startup incorporation guidance.', 'accepted', NULL),
(3, 4, 2, '2026-08-21', '11:30:00', 'Family inheritance dispute regarding ancestral property division in Chattogram.', 'accepted', NULL),
(4, 5, 3, '2026-08-19', '09:30:00', 'Urgent bail application consultation and court proceeding advisory.', 'pending', NULL),
(5, 2, 4, '2026-08-15', '16:00:00', 'Property land title deed verification before real estate purchase.', 'completed', NULL),
(6, 3, 5, '2026-08-12', '13:00:00', 'Tax audit notice response preparation.', 'cancelled', 'Client resolved the matter directly with accountant.');
