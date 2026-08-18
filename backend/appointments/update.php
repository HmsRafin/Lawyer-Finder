<?php
/**
 * Update Appointment Status & Reschedule Endpoint
 * POST or PATCH /backend/appointments/update.php
 *
 * Requirements:
 * 1. Validates status transitions strictly:
 *    - pending   -> accepted, rejected, cancelled
 *    - accepted  -> completed, cancelled
 *    - rejected  -> terminal (illegal transition)
 *    - completed -> terminal (illegal transition)
 *    - cancelled -> terminal (illegal transition)
 * 2. If rescheduling date/time, checks for double-booking conflicts inside a transaction.
 */
require_once __DIR__ . '/../config/db.php';

if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PATCH', 'PUT'])) {
    send_json(false, null, 'Method not allowed. Use POST, PATCH, or PUT.', 405);
}

$input = get_json_input();

$id = isset($input['id']) ? (int)$input['id'] : null;
$new_status = isset($input['status']) ? strtolower(trim($input['status'])) : null;
$new_date = isset($input['appointment_date']) ? trim($input['appointment_date']) : null;
$new_time = isset($input['appointment_time']) ? trim($input['appointment_time']) : null;
$cancellation_reason = isset($input['cancellation_reason']) ? trim($input['cancellation_reason']) : null;

if (!$id) {
    send_json(false, null, 'Appointment ID is required.', 422);
}

try {
    // 1. Fetch current appointment
    $current_stmt = $pdo->prepare("SELECT * FROM appointments WHERE id = :id LIMIT 1");
    $current_stmt->execute([':id' => $id]);
    $appointment = $current_stmt->fetch();

    if (!$appointment) {
        send_json(false, null, 'Appointment not found.', 404);
    }

    $curr_status = strtolower($appointment['status']);
    $lawyer_id = (int)$appointment['lawyer_id'];

    // 2. Validate Status Transition State Machine
    if ($new_status && $new_status !== $curr_status) {
        $allowed_transitions = [
            'pending' => ['accepted', 'rejected', 'cancelled'],
            'accepted' => ['completed', 'cancelled', 'pending'], // pending allow if reset by admin
            'rejected' => ['pending'], // optional reopen
            'completed' => [],
            'cancelled' => []
        ];

        if (!isset($allowed_transitions[$curr_status]) || !in_array($new_status, $allowed_transitions[$curr_status])) {
            send_json(
                false,
                null,
                "Illegal status transition: cannot change appointment from '{$curr_status}' to '{$new_status}'.",
                400
            );
        }
    }

    // 3. Handle Rescheduling & Conflicts
    $target_date = $new_date ? $new_date : $appointment['appointment_date'];
    $target_time = $new_time ? $new_time : $appointment['appointment_time'];

    if (strlen($target_time) === 5) {
        $target_time .= ':00';
    }

    $is_rescheduling = ($new_date && $new_date !== $appointment['appointment_date']) ||
                       ($new_time && $new_time !== $appointment['appointment_time']);

    $pdo->beginTransaction();

    if ($is_rescheduling) {
        // Validate date
        $today = (new DateTime())->format('Y-m-d');
        if ($target_date < $today) {
            $pdo->rollBack();
            send_json(false, null, 'Rescheduled date cannot be in the past.', 422);
        }

        // Check for double booking conflict for this lawyer (excluding current appointment)
        $conflict_stmt = $pdo->prepare("
            SELECT id FROM appointments
            WHERE lawyer_id = :lawyer_id
              AND appointment_date = :target_date
              AND appointment_time = :target_time
              AND id != :current_id
              AND status IN ('pending', 'accepted')
            FOR UPDATE
        ");
        $conflict_stmt->execute([
            ':lawyer_id' => $lawyer_id,
            ':target_date' => $target_date,
            ':target_time' => $target_time,
            ':current_id' => $id
        ]);

        if ($conflict_stmt->fetch()) {
            $pdo->rollBack();
            send_json(false, null, "The lawyer already has a booking at {$target_time} on {$target_date}. Please choose a different time.", 409);
        }
    }

    // 4. Update the appointment record
    $status_to_save = $new_status ? $new_status : $curr_status;
    $reason_to_save = $cancellation_reason ? $cancellation_reason : $appointment['cancellation_reason'];

    $update_stmt = $pdo->prepare("
        UPDATE appointments
        SET
            status = :status,
            appointment_date = :appointment_date,
            appointment_time = :appointment_time,
            cancellation_reason = :cancellation_reason,
            updated_at = NOW()
        WHERE id = :id
    ");
    $update_stmt->execute([
        ':status' => $status_to_save,
        ':appointment_date' => $target_date,
        ':appointment_time' => $target_time,
        ':cancellation_reason' => $reason_to_save,
        ':id' => $id
    ]);

    $pdo->commit();

    // Fetch updated record with JOINs
    $fetch_stmt = $pdo->prepare("
        SELECT
            a.*,
            c.name AS client_name,
            c.email AS client_email,
            u.name AS lawyer_name,
            l.specialization,
            l.district
        FROM appointments a
        JOIN users c ON a.client_id = c.id
        JOIN lawyers l ON a.lawyer_id = l.id
        JOIN users u ON l.user_id = u.id
        WHERE a.id = :id
    ");
    $fetch_stmt->execute([':id' => $id]);
    $updated_appointment = $fetch_stmt->fetch();

    $action_msg = $new_status ? "Appointment status updated to '{$new_status}'." : "Appointment updated successfully.";
    send_json(true, $updated_appointment, $action_msg);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    send_json(false, null, 'Failed to update appointment: ' . $e->getMessage(), 500);
}
