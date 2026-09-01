<?php
/**
 * Create Appointment Endpoint (with Transaction & Double-Booking Guard)
 * POST /backend/appointments/create.php
 *
 * Requirements:
 * 1. Executes inside a database TRANSACTION.
 * 2. Checks using `SELECT ... FOR UPDATE` that the lawyer has no existing
 *    'pending' or 'accepted' appointment at the requested date and time.
 * 3. Inserts the record and commits the transaction.
 * 4. Returns the created appointment record with joined lawyer and client names.
 */
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(false, null, 'Method not allowed. Use POST.', 405);
}

$input = get_json_input();

// Extract parameters
$client_id = isset($input['client_id']) ? (int)$input['client_id'] : null;
$lawyer_id = isset($input['lawyer_id']) ? (int)$input['lawyer_id'] : null;
$appointment_date = trim($input['appointment_date'] ?? '');
$appointment_time = trim($input['appointment_time'] ?? '');
$case_description = trim($input['case_description'] ?? '');

// Fallback to session user if client_id not supplied
if (!$client_id && isset($_SESSION['user']['id'])) {
    $client_id = (int)$_SESSION['user']['id'];
}

// ----------------------------------------------------------------------------
// Validation
// ----------------------------------------------------------------------------
if (!$client_id || !$lawyer_id || empty($appointment_date) || empty($appointment_time) || empty($case_description)) {
    send_json(false, null, 'All fields are required: client_id, lawyer_id, appointment_date, appointment_time, case_description.', 422);
}

// Validate date format (YYYY-MM-DD)
$dateObj = DateTime::createFromFormat('Y-m-d', $appointment_date);
if (!$dateObj || $dateObj->format('Y-m-d') !== $appointment_date) {
    send_json(false, null, 'Invalid date format. Expected YYYY-MM-DD.', 422);
}

// Ensure appointment is not in the past
$today = (new DateTime())->format('Y-m-d');
if ($appointment_date < $today) {
    send_json(false, null, 'Appointment date cannot be in the past.', 422);
}

// Normalize time format to HH:MM:00
if (strlen($appointment_time) === 5) {
    $appointment_time .= ':00';
}

try {
    // Verify client exists
    $client_check = $pdo->prepare("SELECT id, name, email FROM users WHERE id = :client_id LIMIT 1");
    $client_check->execute([':client_id' => $client_id]);
    $client = $client_check->fetch();
    if (!$client) {
        send_json(false, null, 'Client record not found.', 404);
    }

    // Verify lawyer exists
    $lawyer_check = $pdo->prepare("
        SELECT l.id, l.specialization, l.district, l.consultation_fee, u.name AS lawyer_name
        FROM lawyers l
        JOIN users u ON l.user_id = u.id
        WHERE l.id = :lawyer_id
        LIMIT 1
    ");
    $lawyer_check->execute([':lawyer_id' => $lawyer_id]);
    $lawyer = $lawyer_check->fetch();
    if (!$lawyer) {
        send_json(false, null, 'Lawyer record not found.', 404);
    }

    // ========================================================================
    // CRITICAL REQUIREMENT: TRANSACTION & DOUBLE-BOOKING CONFLICT GUARD
    // ========================================================================
    $pdo->beginTransaction();

    /*
     * SQL CONFLICT GUARD:
     * Check with exclusive row lock (FOR UPDATE) whether this lawyer already has
     * an active appointment ('pending' or 'accepted') at the exact date and time.
     */
    $for_update = ($db_driver === 'mysql') ? ' FOR UPDATE' : '';
    $conflict_sql = "
        SELECT id, client_id, status, appointment_date, appointment_time
        FROM appointments
        WHERE lawyer_id = :lawyer_id
          AND appointment_date = :appointment_date
          AND appointment_time = :appointment_time
          AND status IN ('pending', 'accepted')
        {$for_update}
    ";
    $conflict_stmt = $pdo->prepare($conflict_sql);
    $conflict_stmt->execute([
        ':lawyer_id' => $lawyer_id,
        ':appointment_date' => $appointment_date,
        ':appointment_time' => $appointment_time
    ]);

    $existing_conflict = $conflict_stmt->fetch();
    if ($existing_conflict) {
        // Rollback and notify the user of slot collision
        $pdo->rollBack();
        send_json(false, null, "This time slot ({$appointment_time} on {$appointment_date}) has already been reserved. Please select another time slot.", 409);
    }

    // Insert new appointment record
    $insert_sql = "
        INSERT INTO appointments (client_id, lawyer_id, appointment_date, appointment_time, case_description, status, created_at, updated_at)
        VALUES (:client_id, :lawyer_id, :appointment_date, :appointment_time, :case_description, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ";
    $insert_stmt = $pdo->prepare($insert_sql);
    $insert_stmt->execute([
        ':client_id' => $client_id,
        ':lawyer_id' => $lawyer_id,
        ':appointment_date' => $appointment_date,
        ':appointment_time' => $appointment_time,
        ':case_description' => $case_description
    ]);

    $appointment_id = (int)$pdo->lastInsertId();

    // Commit Transaction safely
    $pdo->commit();

    // Fetch the newly created appointment with full JOIN details
    $fetch_sql = "
        SELECT
            a.id,
            a.client_id,
            a.lawyer_id,
            a.appointment_date,
            a.appointment_time,
            a.case_description,
            a.status,
            a.cancellation_reason,
            a.created_at,
            a.updated_at,
            c.name AS client_name,
            c.email AS client_email,
            c.phone AS client_phone,
            u.name AS lawyer_name,
            u.email AS lawyer_email,
            l.specialization,
            l.district,
            l.consultation_fee
        FROM appointments a
        JOIN users c ON a.client_id = c.id
        JOIN lawyers l ON a.lawyer_id = l.id
        JOIN users u ON l.user_id = u.id
        WHERE a.id = :id
        LIMIT 1
    ";
    $fetch_stmt = $pdo->prepare($fetch_sql);
    $fetch_stmt->execute([':id' => $appointment_id]);
    $new_appointment = $fetch_stmt->fetch();

    send_json(true, $new_appointment, 'Appointment requested successfully with Adv. ' . $lawyer['lawyer_name'] . '!', 201);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    send_json(false, null, 'Error booking appointment: ' . $e->getMessage(), 500);
}
