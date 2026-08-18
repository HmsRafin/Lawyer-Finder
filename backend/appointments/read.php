<?php
/**
 * Read Appointments Endpoint (Single + Multi-table JOIN List)
 * GET /backend/appointments/read.php
 *
 * Query Parameters supported:
 * - id: (int) Single appointment lookup
 * - client_id: (int) Filter by client user ID
 * - lawyer_id: (int) Filter by lawyer ID
 * - status: (string) 'pending'|'accepted'|'rejected'|'completed'|'cancelled'
 * - upcoming: (bool) 1/0 Filter for today & future dates
 * - search: (string) Search client name, lawyer name, or case description
 */
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(false, null, 'Method not allowed. Use GET.', 405);
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$client_id = isset($_GET['client_id']) ? (int)$_GET['client_id'] : null;
$lawyer_id = isset($_GET['lawyer_id']) ? (int)$_GET['lawyer_id'] : null;
$status = isset($_GET['status']) ? trim($_GET['status']) : null;
$upcoming = isset($_GET['upcoming']) ? (bool)$_GET['upcoming'] : false;
$search = isset($_GET['search']) ? trim($_GET['search']) : null;

try {
    /*
     * SQL QUERY WITH JOINS:
     * Joins appointments -> users (for client name/email/phone)
     *                   -> lawyers -> users (for lawyer advocate name/email/phone)
     */
    $sql = "
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
            -- Client details
            c.name AS client_name,
            c.email AS client_email,
            c.phone AS client_phone,
            -- Lawyer details
            u.id AS lawyer_user_id,
            u.name AS lawyer_name,
            u.email AS lawyer_email,
            u.phone AS lawyer_phone,
            l.specialization,
            l.district,
            l.experience_years,
            l.bar_license,
            l.consultation_fee,
            l.rating AS lawyer_rating
        FROM appointments a
        INNER JOIN users c ON a.client_id = c.id
        INNER JOIN lawyers l ON a.lawyer_id = l.id
        INNER JOIN users u ON l.user_id = u.id
        WHERE 1=1
    ";

    $params = [];

    // Filter by single ID
    if ($id) {
        $sql .= " AND a.id = :id";
        $params[':id'] = $id;
    }

    // Filter by Client ID
    if ($client_id) {
        $sql .= " AND a.client_id = :client_id";
        $params[':client_id'] = $client_id;
    }

    // Filter by Lawyer ID
    if ($lawyer_id) {
        $sql .= " AND a.lawyer_id = :lawyer_id";
        $params[':lawyer_id'] = $lawyer_id;
    }

    // Filter by Status
    if ($status && in_array(strtolower($status), ['pending', 'accepted', 'rejected', 'completed', 'cancelled'])) {
        $sql .= " AND a.status = :status";
        $params[':status'] = strtolower($status);
    }

    // Filter for Upcoming Appointments
    if ($upcoming) {
        $sql .= " AND a.appointment_date >= CURDATE()";
    }

    // Search query
    if (!empty($search)) {
        $sql .= " AND (c.name LIKE :search OR u.name LIKE :search OR a.case_description LIKE :search OR l.specialization LIKE :search)";
        $params[':search'] = '%' . $search . '%';
    }

    // Order by date and time (most upcoming first)
    $sql .= " ORDER BY a.appointment_date DESC, a.appointment_time DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    if ($id) {
        $appointment = $stmt->fetch();
        if (!$appointment) {
            send_json(false, null, 'Appointment not found.', 404);
        }
        send_json(true, $appointment, 'Appointment retrieved successfully.');
    } else {
        $appointments = $stmt->fetchAll();
        send_json(true, $appointments, 'Appointments list retrieved successfully (' . count($appointments) . ' records).');
    }

} catch (PDOException $e) {
    send_json(false, null, 'Failed to fetch appointments: ' . $e->getMessage(), 500);
}
