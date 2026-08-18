<?php
/**
 * Read Lawyers Endpoint
 * GET /backend/lawyers/read.php
 */
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(false, null, 'Method not allowed. Use GET.', 405);
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$specialization = isset($_GET['specialization']) ? trim($_GET['specialization']) : null;
$district = isset($_GET['district']) ? trim($_GET['district']) : null;
$search = isset($_GET['search']) ? trim($_GET['search']) : null;

try {
    $sql = "
        SELECT
            l.id,
            l.user_id,
            u.name,
            u.email,
            u.phone,
            l.specialization,
            l.district,
            l.bio,
            l.experience_years,
            l.bar_license,
            l.consultation_fee,
            l.rating,
            l.reviews_count,
            l.created_at
        FROM lawyers l
        JOIN users u ON l.user_id = u.id
        WHERE 1=1
    ";

    $params = [];

    if ($id) {
        $sql .= " AND l.id = :id";
        $params[':id'] = $id;
    }

    if (!empty($specialization) && $specialization !== 'All') {
        $sql .= " AND l.specialization = :specialization";
        $params[':specialization'] = $specialization;
    }

    if (!empty($district) && $district !== 'All') {
        $sql .= " AND l.district = :district";
        $params[':district'] = $district;
    }

    if (!empty($search)) {
        $sql .= " AND (u.name LIKE :search OR l.specialization LIKE :search OR l.district LIKE :search OR l.bio LIKE :search)";
        $params[':search'] = '%' . $search . '%';
    }

    $sql .= " ORDER BY l.rating DESC, l.experience_years DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    if ($id) {
        $lawyer = $stmt->fetch();
        if (!$lawyer) {
            send_json(false, null, 'Lawyer profile not found.', 404);
        }
        send_json(true, $lawyer, 'Lawyer profile retrieved.');
    } else {
        $lawyers = $stmt->fetchAll();
        send_json(true, $lawyers, 'Lawyers list retrieved successfully (' . count($lawyers) . ' found).');
    }

} catch (PDOException $e) {
    send_json(false, null, 'Failed to retrieve lawyers: ' . $e->getMessage(), 500);
}
