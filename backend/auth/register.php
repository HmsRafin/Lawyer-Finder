<?php
/**
 * User Registration Endpoint (Client / Lawyer)
 * POST /backend/auth/register.php
 */
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(false, null, 'Method not allowed. Use POST.', 405);
}

$input = get_json_input();
$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$role = trim($input['role'] ?? 'client');
$phone = trim($input['phone'] ?? '');

// Validation
if (empty($name) || empty($email) || empty($password)) {
    send_json(false, null, 'Name, email, and password are required fields.', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_json(false, null, 'Please provide a valid email address.', 422);
}

if (strlen($password) < 6) {
    send_json(false, null, 'Password must be at least 6 characters.', 422);
}

if (!in_array($role, ['client', 'lawyer'])) {
    send_json(false, null, 'Role must be either "client" or "lawyer".', 422);
}

try {
    // Check if email already registered
    $check_stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
    $check_stmt->execute([':email' => $email]);
    if ($check_stmt->fetch()) {
        send_json(false, null, 'An account with this email address already exists.', 409);
    }

    $pdo->beginTransaction();

    // Secure password hashing
    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    $user_stmt = $pdo->prepare("
        INSERT INTO users (name, email, password_hash, role, phone, created_at)
        VALUES (:name, :email, :password_hash, :role, :phone, CURRENT_TIMESTAMP)
    ");
    $user_stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':password_hash' => $password_hash,
        ':role' => $role,
        ':phone' => $phone
    ]);
    $user_id = (int)$pdo->lastInsertId();

    $lawyer_id = null;
    // If registered as lawyer, initialize lawyer profile record
    if ($role === 'lawyer') {
        $specialization = trim($input['specialization'] ?? 'Corporate');
        $district = trim($input['district'] ?? 'Dhaka');
        $experience_years = (int)($input['experience_years'] ?? 1);
        $bio = trim($input['bio'] ?? 'Dedicated advocate offering legal counseling and representation.');
        $bar_license = trim($input['bar_license'] ?? ('BAR-' . date('Y') . '-' . str_pad($user_id, 4, '0', STR_PAD_LEFT)));
        $consultation_fee = (float)($input['consultation_fee'] ?? 1500.00);

        $lawyer_stmt = $pdo->prepare("
            INSERT INTO lawyers (user_id, specialization, district, bio, experience_years, bar_license, consultation_fee, rating, reviews_count)
            VALUES (:user_id, :specialization, :district, :bio, :experience_years, :bar_license, :consultation_fee, 5.0, 0)
        ");
        $lawyer_stmt->execute([
            ':user_id' => $user_id,
            ':specialization' => $specialization,
            ':district' => $district,
            ':bio' => $bio,
            ':experience_years' => $experience_years,
            ':bar_license' => $bar_license,
            ':consultation_fee' => $consultation_fee
        ]);
        $lawyer_id = (int)$pdo->lastInsertId();
    }

    $pdo->commit();

    // Store in Session
    $userData = [
        'id' => $user_id,
        'name' => $name,
        'email' => $email,
        'role' => $role,
        'phone' => $phone,
        'lawyer_id' => $lawyer_id
    ];
    $_SESSION['user'] = $userData;

    send_json(true, $userData, 'Registration successful. Welcome to Lawyer Finder!', 201);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    send_json(false, null, 'Registration failed: ' . $e->getMessage(), 500);
}
