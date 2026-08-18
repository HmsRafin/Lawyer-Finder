<?php
/**
 * Database Configuration and Core API Helpers
 * Lawyer Finder Backend (XAMPP PDO MySQL)
 */

// Enable session support
if (session_status() === PHP_SESSION_NONE) {
    // 7-day session lifetime
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
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ----------------------------------------------------------------------------
// Database Connection Settings (XAMPP Defaults)
// ----------------------------------------------------------------------------
$db_host = 'localhost';
$db_port = '3306';
$db_name = 'lawyer_finder';
$db_user = 'root';
$db_pass = ''; // Default XAMPP password is empty

try {
    $dsn = "mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4";
    $pdo = new PDO($dsn, $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);
} catch (PDOException $e) {
    // Return structured JSON on connection error
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'data' => null,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit;
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
