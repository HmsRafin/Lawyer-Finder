<?php
/**
 * User Authentication / Login Endpoint
 * POST /backend/auth/login.php
 */
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(false, null, 'Method not allowed. Use POST.', 405);
}

$input = get_json_input();
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    send_json(false, null, 'Please provide both email and password.', 422);
}

try {
    // Find user by email
    $stmt = $pdo->prepare("
        SELECT u.id, u.name, u.email, u.password_hash, u.role, u.phone,
               l.id AS lawyer_id, l.specialization, l.district, l.experience_years
        FROM users u
        LEFT JOIN lawyers l ON u.id = l.user_id
        WHERE u.email = :email
        LIMIT 1
    ");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        send_json(false, null, 'Invalid email or password. Please try again.', 401);
    }

    // Sanitize user object for session and response
    $userData = [
        'id' => (int)$user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'phone' => $user['phone'],
        'lawyer_id' => $user['lawyer_id'] ? (int)$user['lawyer_id'] : null,
        'specialization' => $user['specialization'],
        'district' => $user['district']
    ];

    $_SESSION['user'] = $userData;

    send_json(true, $userData, 'Login successful. Welcome back!');

} catch (PDOException $e) {
    send_json(false, null, 'Login query failed: ' . $e->getMessage(), 500);
}
