<?php
/**
 * Advanced SQL Queries & Analytics Execution Endpoint
 * GET /backend/analytics/queries.php?query_key=...
 *
 * Demonstrates:
 * - INNER, LEFT, RIGHT, FULL OUTER, NULL/ANTI JOIN
-- UNION, INTERSECTION, DIFFERENCE
 * - Aggregate functions (COUNT, SUM, AVG, MIN, MAX), Mathematical Division, Relational Division
 * - Subqueries (Scalar, Correlated, Derived Tables, CTEs)
 */
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(false, null, 'Method not allowed. Use GET.', 405);
}

$query_key = isset($_GET['key']) ? trim($_GET['key']) : 'all_catalog';

$queries_catalog = [
    // 1. JOINS
    'inner_join' => [
        'title' => 'INNER JOIN — Appointments with Client & Lawyer Details',
        'category' => 'JOINs',
        'sql' => "SELECT a.id AS appointment_id, c.name AS client_name, c.email AS client_email, l_user.name AS lawyer_name, l.specialization, l.district, l.consultation_fee, a.appointment_date, a.appointment_time, a.status FROM appointments a INNER JOIN users c ON a.client_id = c.id INNER JOIN lawyers l ON a.lawyer_id = l.id INNER JOIN users l_user ON l.user_id = l_user.id ORDER BY a.appointment_date DESC LIMIT 15;"
    ],
    'left_join' => [
        'title' => 'LEFT JOIN — All Registered Clients & History (Including 0 bookings)',
        'category' => 'JOINs',
        'sql' => "SELECT u.id AS client_id, u.name AS client_name, u.email, u.phone, a.id AS appointment_id, a.appointment_date, a.status FROM users u LEFT JOIN appointments a ON u.id = a.client_id WHERE u.role = 'client' ORDER BY u.id;"
    ],
    'right_join' => [
        'title' => 'RIGHT JOIN — All Registered Lawyers & Assigned Cases',
        'category' => 'JOINs',
        'sql' => "SELECT l.id AS lawyer_id, u.name AS lawyer_name, l.specialization, l.district, a.id AS appointment_id, a.status AS appointment_status FROM appointments a RIGHT JOIN lawyers l ON a.lawyer_id = l.id INNER JOIN users u ON l.user_id = u.id ORDER BY l.id;"
    ],
    'full_join' => [
        'title' => 'FULL OUTER JOIN — Union of Left & Right Joins for Universal Matching',
        'category' => 'JOINs',
        'sql' => "SELECT u.name AS person_name, u.role, l.specialization, a.id AS appointment_id, a.status FROM users u LEFT JOIN appointments a ON u.id = a.client_id LEFT JOIN lawyers l ON a.lawyer_id = l.id UNION SELECT u.name AS person_name, u.role, l.specialization, a.id AS appointment_id, a.status FROM appointments a RIGHT JOIN lawyers l ON a.lawyer_id = l.id RIGHT JOIN users u ON l.user_id = u.id LIMIT 20;"
    ],
    'null_join' => [
        'title' => 'NULL JOIN / ANTI-JOIN — Lawyers with NO Booked Appointments',
        'category' => 'JOINs',
        'sql' => "SELECT l.id AS lawyer_id, u.name AS lawyer_name, l.specialization, l.district, l.consultation_fee FROM lawyers l INNER JOIN users u ON l.user_id = u.id LEFT JOIN appointments a ON l.id = a.lawyer_id WHERE a.id IS NULL;"
    ],

    // 2. SET OPERATIONS
    'union' => [
        'title' => 'UNION — Consolidated Contact Directory of Clients and Lawyers',
        'category' => 'Set Operations',
        'sql' => "SELECT name, email, phone, 'Client' AS role_category FROM users WHERE role = 'client' UNION SELECT name, email, phone, 'Lawyer' AS role_category FROM users WHERE role = 'lawyer' ORDER BY name ASC;"
    ],
    'intersection' => [
        'title' => 'INTERSECTION — Districts with High-Fee Lawyers & Active Bookings',
        'category' => 'Set Operations',
        'sql' => "SELECT DISTINCT l1.district FROM lawyers l1 WHERE l1.consultation_fee >= 1500 AND EXISTS (SELECT 1 FROM appointments a JOIN lawyers l2 ON a.lawyer_id = l2.id WHERE l2.district = l1.district AND a.status = 'accepted');"
    ],
    'difference' => [
        'title' => 'DIFFERENCE / EXCEPT — Districts with Lawyers but NO Bookings',
        'category' => 'Set Operations',
        'sql' => "SELECT DISTINCT l.district FROM lawyers l WHERE l.district NOT IN (SELECT DISTINCT l2.district FROM appointments a JOIN lawyers l2 ON a.lawyer_id = l2.id);"
    ],

    // 3. AGGREGATES & DIVISION
    'aggregates' => [
        'title' => 'AGGREGATES — COUNT, SUM, AVG, MIN, MAX by Legal Specialization',
        'category' => 'Aggregates & Division',
        'sql' => "SELECT l.specialization, COUNT(a.id) AS total_appointments, COUNT(DISTINCT a.client_id) AS unique_clients, COALESCE(SUM(l.consultation_fee), 0) AS potential_revenue, ROUND(AVG(l.consultation_fee), 2) AS avg_fee, MIN(l.consultation_fee) AS min_fee, MAX(l.consultation_fee) AS max_fee, ROUND(AVG(l.rating), 2) AS avg_rating FROM lawyers l LEFT JOIN appointments a ON l.id = a.lawyer_id GROUP BY l.specialization ORDER BY potential_revenue DESC;"
    ],
    'math_division' => [
        'title' => 'MATH DIVISION — Specialization Revenue Share Percentage',
        'category' => 'Aggregates & Division',
        'sql' => "SELECT l.specialization, COUNT(a.id) AS appointment_count, SUM(l.consultation_fee) AS specialization_revenue, ROUND((SUM(l.consultation_fee) / (SELECT SUM(l2.consultation_fee) FROM appointments a2 JOIN lawyers l2 ON a2.lawyer_id = l2.id)) * 100, 2) AS revenue_share_pct FROM appointments a JOIN lawyers l ON a.lawyer_id = l.id GROUP BY l.specialization;"
    ],
    'relational_division' => [
        'title' => 'RELATIONAL DIVISION — Lawyers Handling Bookings Across All Known Statuses',
        'category' => 'Aggregates & Division',
        'sql' => "SELECT l.id AS lawyer_id, u.name AS lawyer_name, l.specialization, COUNT(DISTINCT a.status) AS handled_status_count FROM lawyers l JOIN users u ON l.user_id = u.id JOIN appointments a ON l.id = a.lawyer_id GROUP BY l.id, u.name, l.specialization HAVING COUNT(DISTINCT a.status) = (SELECT COUNT(DISTINCT status) FROM appointments);"
    ],

    // 4. SUBQUERIES
    'scalar_subquery' => [
        'title' => 'SCALAR SUBQUERY — Lawyers Charging Above the Platform Average Fee',
        'category' => 'Subqueries',
        'sql' => "SELECT l.id AS lawyer_id, u.name AS lawyer_name, l.specialization, l.district, l.consultation_fee, (SELECT ROUND(AVG(consultation_fee), 2) FROM lawyers) AS platform_avg_fee, ROUND(l.consultation_fee - (SELECT AVG(consultation_fee) FROM lawyers), 2) AS diff_above_avg FROM lawyers l JOIN users u ON l.user_id = u.id WHERE l.consultation_fee > (SELECT AVG(consultation_fee) FROM lawyers) ORDER BY l.consultation_fee DESC;"
    ],
    'correlated_subquery' => [
        'title' => 'CORRELATED SUBQUERY (EXISTS) — Clients with Active/Accepted Consultations',
        'category' => 'Subqueries',
        'sql' => "SELECT u.id AS client_id, u.name AS client_name, u.email, u.phone FROM users u WHERE u.role = 'client' AND EXISTS (SELECT 1 FROM appointments a WHERE a.client_id = u.id AND a.status IN ('accepted', 'completed'));"
    ],
    'derived_table' => [
        'title' => 'DERIVED TABLE (FROM Subquery) — Lawyer Performance Tier Breakdown',
        'category' => 'Subqueries',
        'sql' => "SELECT tier_summary.performance_tier, COUNT(tier_summary.lawyer_id) AS total_lawyers, ROUND(AVG(tier_summary.consultation_fee), 2) AS avg_fee, ROUND(AVG(tier_summary.rating), 2) AS avg_rating FROM (SELECT id AS lawyer_id, consultation_fee, rating, CASE WHEN rating >= 4.80 AND experience_years >= 8 THEN 'Top Tier / Veteran' WHEN rating >= 4.50 THEN 'Senior Practitioner' ELSE 'Associate' END AS performance_tier FROM lawyers) AS tier_summary GROUP BY tier_summary.performance_tier ORDER BY avg_rating DESC;"
    ],
    'cte_analytics' => [
        'title' => 'CTE & COMPLEX AGGREGATE — Full Performance & Completion Rate Metric',
        'category' => 'Subqueries',
        'sql' => "WITH LawyerAppointmentStats AS (SELECT l.id AS lawyer_id, u.name AS lawyer_name, l.specialization, l.district, COUNT(a.id) AS total_bookings, SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) AS completed_bookings, COALESCE(SUM(CASE WHEN a.status = 'completed' THEN l.consultation_fee ELSE 0 END), 0) AS realized_revenue FROM lawyers l JOIN users u ON l.user_id = u.id LEFT JOIN appointments a ON l.id = a.lawyer_id GROUP BY l.id, u.name, l.specialization, l.district) SELECT las.lawyer_id, las.lawyer_name, las.specialization, las.district, las.total_bookings, las.completed_bookings, las.realized_revenue, CASE WHEN las.total_bookings > 0 THEN ROUND((las.completed_bookings / las.total_bookings) * 100, 1) ELSE 0.0 END AS completion_rate_pct FROM LawyerAppointmentStats las WHERE las.lawyer_id IN (SELECT id FROM lawyers WHERE rating >= 4.50) ORDER BY las.realized_revenue DESC, las.total_bookings DESC;"
    ]
];

try {
    if ($query_key === 'all_catalog') {
        // Return catalog list with queries
        $catalog_data = [];
        foreach ($queries_catalog as $k => $item) {
            $catalog_data[] = [
                'key' => $k,
                'title' => $item['title'],
                'category' => $item['category'],
                'sql' => $item['sql']
            ];
        }
        send_json(true, $catalog_data, 'SQL Query Catalog retrieved.');
    }

    if (!isset($queries_catalog[$query_key])) {
        send_json(false, null, 'Invalid query key requested.', 404);
    }

    $target = $queries_catalog[$query_key];
    $stmt = $pdo->query($target['sql']);
    $rows = $stmt->fetchAll();

    send_json(true, [
        'key' => $query_key,
        'title' => $target['title'],
        'category' => $target['category'],
        'sql' => $target['sql'],
        'count' => count($rows),
        'rows' => $rows
    ], 'Query executed successfully.');

} catch (PDOException $e) {
    send_json(false, [
        'key' => $query_key,
        'sql' => isset($queries_catalog[$query_key]) ? $queries_catalog[$query_key]['sql'] : '',
        'error' => $e->getMessage()
    ], 'Query execution error: ' . $e->getMessage(), 500);
}
