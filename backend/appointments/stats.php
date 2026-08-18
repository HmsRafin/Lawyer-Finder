<?php
/**
 * Appointments Statistics & Aggregates Endpoint
 * GET /backend/appointments/stats.php
 *
 * SQL Operations included:
 * 1. Count per status per lawyer (GROUP BY lawyer_id, status)
 * 2. Upcoming appointment count per lawyer
 * 3. Platform aggregates (total counts, by specialization, by status)
 */
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(false, null, 'Method not allowed. Use GET.', 405);
}

$lawyer_id = isset($_GET['lawyer_id']) ? (int)$_GET['lawyer_id'] : null;

try {
    $stats = [];

    if ($lawyer_id) {
        // --------------------------------------------------------------------
        // 1. Lawyer-Specific Aggregates
        // --------------------------------------------------------------------

        // Status Breakdown for this lawyer
        $status_stmt = $pdo->prepare("
            SELECT
                status,
                COUNT(*) as count
            FROM appointments
            WHERE lawyer_id = :lawyer_id
            GROUP BY status
        ");
        $status_stmt->execute([':lawyer_id' => $lawyer_id]);
        $status_breakdown = $status_stmt->fetchAll();

        // Convert to associative map
        $status_map = ['pending' => 0, 'accepted' => 0, 'rejected' => 0, 'completed' => 0, 'cancelled' => 0];
        $total_cases = 0;
        foreach ($status_breakdown as $row) {
            $status_map[$row['status']] = (int)$row['count'];
            $total_cases += (int)$row['count'];
        }

        // Upcoming appointments count (today or future dates)
        $upcoming_stmt = $pdo->prepare("
            SELECT COUNT(*) as upcoming_count
            FROM appointments
            WHERE lawyer_id = :lawyer_id
              AND status IN ('pending', 'accepted')
              AND appointment_date >= CURDATE()
        ");
        $upcoming_stmt->execute([':lawyer_id' => $lawyer_id]);
        $upcoming = (int)$upcoming_stmt->fetchColumn();

        // Lawyer profile metadata
        $lawyer_stmt = $pdo->prepare("
            SELECT l.rating, l.reviews_count, u.name, l.specialization
            FROM lawyers l
            JOIN users u ON l.user_id = u.id
            WHERE l.id = :lawyer_id
            LIMIT 1
        ");
        $lawyer_stmt->execute([':lawyer_id' => $lawyer_id]);
        $lawyer_info = $lawyer_stmt->fetch();

        $stats = [
            'lawyer_id' => $lawyer_id,
            'lawyer_info' => $lawyer_info,
            'total_cases' => $total_cases,
            'active_cases' => $status_map['accepted'],
            'pending_requests' => $status_map['pending'],
            'completed_cases' => $status_map['completed'],
            'cancelled_cases' => $status_map['cancelled'],
            'upcoming_count' => $upcoming,
            'status_breakdown' => $status_map
        ];

    } else {
        // --------------------------------------------------------------------
        // 2. Global / Platform-wide Aggregates (for Admin Dashboard)
        // --------------------------------------------------------------------

        // Total Counts
        $total_users = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'client'")->fetchColumn();
        $total_lawyers = (int)$pdo->query("SELECT COUNT(*) FROM lawyers")->fetchColumn();
        $total_appointments = (int)$pdo->query("SELECT COUNT(*) FROM appointments")->fetchColumn();

        // Upcoming appointments this week
        $this_week = (int)$pdo->query("
            SELECT COUNT(*) FROM appointments
            WHERE appointment_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        ")->fetchColumn();

        // Status breakdown
        $status_stmt = $pdo->query("
            SELECT status, COUNT(*) as count
            FROM appointments
            GROUP BY status
        ");
        $status_breakdown = $status_stmt->fetchAll();

        // Specialization breakdown
        $spec_stmt = $pdo->query("
            SELECT l.specialization, COUNT(a.id) as appointment_count
            FROM lawyers l
            LEFT JOIN appointments a ON l.id = a.lawyer_id
            GROUP BY l.specialization
        ");
        $spec_breakdown = $spec_stmt->fetchAll();

        // Lawyer status summary (GROUP BY lawyer_id, status)
        $lawyer_group_stmt = $pdo->query("
            SELECT
                l.id AS lawyer_id,
                u.name AS lawyer_name,
                l.specialization,
                a.status,
                COUNT(a.id) as count
            FROM lawyers l
            JOIN users u ON l.user_id = u.id
            LEFT JOIN appointments a ON l.id = a.lawyer_id
            GROUP BY l.id, u.name, l.specialization, a.status
        ");
        $lawyer_breakdown = $lawyer_group_stmt->fetchAll();

        $stats = [
            'total_clients' => $total_users,
            'total_lawyers' => $total_lawyers,
            'total_appointments' => $total_appointments,
            'appointments_this_week' => $this_week,
            'status_breakdown' => $status_breakdown,
            'specialization_breakdown' => $spec_breakdown,
            'lawyer_status_aggregates' => $lawyer_breakdown
        ];
    }

    send_json(true, $stats, 'Appointment statistics calculated successfully.');

} catch (PDOException $e) {
    send_json(false, null, 'Failed to calculate stats: ' . $e->getMessage(), 500);
}
