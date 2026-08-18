<?php
/**
 * Current Session Endpoint
 * GET /backend/auth/me.php
 */
require_once __DIR__ . '/../config/db.php';

$user = get_auth_user();

if (!$user) {
    send_json(false, null, 'No active session found.', 401);
}

send_json(true, $user, 'Active session retrieved successfully.');
