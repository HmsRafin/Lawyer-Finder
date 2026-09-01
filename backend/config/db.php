<?php
/**
 * Database Configuration and Universal PDO Connector
 * Lawyer Finder Backend
 *
 * Supports:
 * 1. Primary: MySQL (XAMPP localhost:3306 / 127.0.0.1) with auto-creation & auto-import of schema.sql
 * 2. Fallback: Persistent SQLite (backend/database/lawyer_finder.sqlite) if MySQL is stopped
 */

// Enable session support with secure settings
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    session_start();
}

// ----------------------------------------------------------------------------
// CORS Headers for React Vite Localhost & Production
// ----------------------------------------------------------------------------
$allowed_origins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
];

$http_origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($http_origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $http_origin");
} else {
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle OPTIONS preflight request immediately
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ----------------------------------------------------------------------------
// Database Connection Settings & Auto-Fallback
// ----------------------------------------------------------------------------
$db_host = '127.0.0.1'; // 127.0.0.1 is more reliable than localhost on Windows
$db_port = '3306';
$db_name = 'lawyer_finder';
$db_user = 'root';
$db_pass = ''; // Default XAMPP password is empty

$pdo = null;
$db_driver = 'mysql';

// 1. Attempt MySQL Connection
try {
    $dsn = "mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4";
    $pdo = new PDO($dsn, $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    $pdo->exec("SET NAMES utf8mb4");
    $db_driver = 'mysql';
} catch (PDOException $e) {
    // If database does not exist yet on MySQL, try connecting without dbname and create it
    try {
        $dsn_server = "mysql:host={$db_host};port={$db_port};charset=utf8mb4";
        $server_pdo = new PDO($dsn_server, $db_user, $db_pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $server_pdo->exec("CREATE DATABASE IF NOT EXISTS `{$db_name}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        
        $pdo = new PDO($dsn, $db_user, $db_pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $pdo->exec("SET NAMES utf8mb4");
        
        // Import schema if tables are missing
        $check_tables = $pdo->query("SHOW TABLES LIKE 'users'")->fetch();
        if (!$check_tables) {
            $schema_path = __DIR__ . '/../database/schema.sql';
            if (file_exists($schema_path)) {
                $sql = file_get_contents($schema_path);
                $pdo->exec($sql);
            }
        }
        $db_driver = 'mysql';
    } catch (PDOException $mysql_fallback_err) {
        // 2. MySQL is offline / unreachable — Fallback to persistent SQLite
        $sqlite_file = __DIR__ . '/../database/lawyer_finder.sqlite';
        try {
            $pdo = new PDO("sqlite:" . $sqlite_file, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            $pdo->exec("PRAGMA foreign_keys = ON;");
            $db_driver = 'sqlite';

            // Initialize SQLite schema if tables missing
            init_sqlite_schema_if_needed($pdo);
        } catch (PDOException $sqlite_err) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'data' => null,
                'message' => 'Database connection failed: MySQL (' . $e->getMessage() . ') and SQLite (' . $sqlite_err->getMessage() . ')'
            ]);
            exit;
        }
    }
}

/**
 * SQLite Schema Initializer with complete seed data
 */
function init_sqlite_schema_if_needed($db) {
    $table_check = $db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")->fetch();
    if ($table_check) {
        return;
    }

    $db->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'client',
            phone TEXT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS lawyers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            specialization TEXT NOT NULL,
            district TEXT NOT NULL,
            bio TEXT NULL,
            experience_years INTEGER NOT NULL DEFAULT 1,
            bar_license TEXT NULL,
            consultation_fee REAL NOT NULL DEFAULT 1000.00,
            rating REAL NOT NULL DEFAULT 4.80,
            reviews_count INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
        );

        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER NOT NULL,
            lawyer_id INTEGER NOT NULL,
            appointment_date TEXT NOT NULL,
            appointment_time TEXT NOT NULL,
            case_description TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            cancellation_reason TEXT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (lawyer_id) REFERENCES lawyers (id) ON DELETE CASCADE ON UPDATE CASCADE
        );

        -- Insert Initial Users
        INSERT INTO users (id, name, email, password_hash, role, phone) VALUES
        (1, 'System Admin', 'admin@lawyerfinder.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '+8801700000000'),
        (2, 'Sadia Anwar', 'sadia@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', '+8801711111111'),
        (3, 'Mahin Hasan', 'mahin@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', '+8801722222222'),
        (4, 'Nusrat Tania', 'nusrat@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', '+8801733333333'),
        (5, 'Farhan Ahmed', 'farhan@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', '+8801744444444'),
        (6, 'Adv. Rahim Karim', 'rahim@lawyer.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', '+8801811111111'),
        (7, 'Adv. Farzana Yasmin', 'farzana@lawyer.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', '+8801822222222'),
        (8, 'Adv. Kamrul Hasan', 'kamrul@lawyer.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', '+8801833333333'),
        (9, 'Adv. Nasrin Akter', 'nasrin@lawyer.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', '+8801844444444'),
        (10, 'Adv. Shafiul Alam', 'shafiul@lawyer.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', '+8801855555555'),
        (11, 'Adv. Tania Rahman', 'tania@lawyer.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', '+8801866666666');

        -- Insert Lawyers
        INSERT INTO lawyers (id, user_id, specialization, district, bio, experience_years, bar_license, consultation_fee, rating, reviews_count) VALUES
        (1, 6, 'Corporate', 'Dhaka', 'Senior corporate and commercial lawyer specializing in contract compliance, cross-border M&A, and company registrations.', 9, 'DBA-2019-00417', 2500.00, 4.90, 128),
        (2, 7, 'Family', 'Chattogram', 'Expert in family law, child custody mediation, inheritance disputes, and marital property settlements.', 7, 'CBA-2021-00892', 1800.00, 4.80, 96),
        (3, 8, 'Criminal', 'Sylhet', 'Dedicated defense attorney focusing on criminal litigation, bail applications, and high-profile appellate hearings.', 12, 'SBA-2016-00129', 3000.00, 4.70, 142),
        (4, 9, 'Property', 'Khulna', 'Specialized in real estate title verification, deed registration, and land dispute settlements.', 6, 'KBA-2022-00543', 1500.00, 4.90, 81),
        (5, 10, 'Tax', 'Rajshahi', 'Certified tax consultant assisting corporations and individuals with NBR audits and tribunal appeals.', 8, 'RBA-2020-00331', 2000.00, 4.60, 64),
        (6, 11, 'Labor', 'Dhaka', 'Advocate for employee rights, workplace regulations, industrial disputes, and severance disputes.', 5, 'DBA-2023-00912', 1400.00, 4.80, 110);

        -- Insert Appointments
        INSERT INTO appointments (id, client_id, lawyer_id, appointment_date, appointment_time, case_description, status, cancellation_reason) VALUES
        (1, 2, 1, '2026-08-20', '10:30:00', 'Need consultation for cross-border software licensing agreement and VAT compliance.', 'pending', NULL),
        (2, 3, 1, '2026-08-22', '14:30:00', 'Shareholders agreement drafting and startup incorporation guidance.', 'accepted', NULL),
        (3, 4, 2, '2026-08-21', '11:30:00', 'Family inheritance dispute regarding ancestral property division in Chattogram.', 'accepted', NULL),
        (4, 5, 3, '2026-08-19', '09:30:00', 'Urgent bail application consultation and court proceeding advisory.', 'pending', NULL),
        (5, 2, 4, '2026-08-15', '16:00:00', 'Property land title deed verification before real estate purchase.', 'completed', NULL),
        (6, 3, 5, '2026-08-12', '13:00:00', 'Tax audit notice response preparation.', 'cancelled', 'Client resolved the matter directly with accountant.');
    ");
}

// ----------------------------------------------------------------------------
// Helper: Standardized JSON Output Response
// ----------------------------------------------------------------------------
function send_json($success = true, $data = null, $message = '', $status_code = 200) {
    http_response_code($status_code);
    echo json_encode([
        'success' => (bool)$success,
        'data' => $data,
        'message' => (string)$message
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// ----------------------------------------------------------------------------
// Helper: Parse JSON Payload from Request Body
// ----------------------------------------------------------------------------
function get_json_input() {
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return $_POST;
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

// ----------------------------------------------------------------------------
// Helper: Require Authentication Session
// ----------------------------------------------------------------------------
function get_auth_user() {
    if (isset($_SESSION['user']) && !empty($_SESSION['user']['id'])) {
        return $_SESSION['user'];
    }
    return null;
}
