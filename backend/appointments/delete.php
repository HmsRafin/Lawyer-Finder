<?php
/**
 * Cancel / Soft-Delete Appointment Endpoint
 * POST or DELETE /backend/appointments/delete.php
 *
 * Requirements:
 * Soft-cancels the appointment by updating status to 'cancelled' (not hard DELETE),
 * so that historical records and logs remain intact.
 */
require_once __DIR__ . '/../config/db.php';

if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'DELETE'])) {
    send_json(false, null, 'Method not allowed. Use POST or DELETE.', 405);
}

$input = get_json_input();
$id = isset($input['id']) ? (int)$input['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : null);
$reason = trim($input['reason'] ?? ($input['cancellation_reason'] ?? 'Cancelled by user'));

if (!$id) {
    send_json(false, null, 'Appointment ID is required.', 422);
}

try {
    // Check existence
    $check_stmt = $pdo->prepare("SELECT id, status FROM appointments WHERE id = :id LIMIT 1");
    $check_stmt->execute([':id' => $id]);
    $appointment = $check_stmt->fetch();

    if (!$appointment) {
        send_json(false, null, 'Appointment not found.', 404);
    }

    if ($appointment['status'] === 'cancelled') {
        send_json(true, $appointment, 'Appointment is already cancelled.');
    }

    if ($appointment['status'] === 'completed') {
        send_json(false, null, 'Completed appointments cannot be cancelled.', 400);
    }

    // Soft-cancel (preserving historical records)
    $stmt = $pdo->prepare("
        UPDATE appointments
        SET
            status = 'cancelled',
            cancellation_reason = :reason,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = :id
    ");
    $stmt->execute([
        ':reason' => $reason,
        ':id' => $id
    ]);

    send_json(true, ['id' => $id, 'status' => 'cancelled', 'reason' => $reason], 'Appointment successfully cancelled.');

} catch (PDOException $e) {
    send_json(false, null, 'Failed to cancel appointment: ' . $e->getMessage(), 500);
}
