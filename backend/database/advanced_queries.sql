-- ============================================================================
-- Lawyer Finder - Advanced Raw SQL Queries
-- Project: CSE 3104 - Database Systems Lab / Legal Platform
-- Includes:
--   1. JOINs: INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, NULL / ANTI-JOIN
--   2. Set Operations: UNION, UNION ALL, INTERSECT, DIFFERENCE / EXCEPT
--   3. Aggregate Functions & Division: COUNT, SUM, AVG, MIN, MAX, Math Division, Relational Division
--   4. Subqueries: Scalar Subquery, Correlated Subquery, Subquery in FROM (Derived Table), IN / NOT IN, CTE (WITH clause)
-- ============================================================================

USE `lawyer_finder`;

-- ============================================================================
-- 1. JOIN OPERATIONS
-- ============================================================================

-- 1.1 INNER JOIN: Get all appointments with matched Client and Lawyer details
SELECT 
    a.id AS appointment_id,
    c.name AS client_name,
    c.email AS client_email,
    c.phone AS client_phone,
    l_user.name AS lawyer_name,
    l.specialization,
    l.district AS lawyer_district,
    l.consultation_fee,
    a.appointment_date,
    a.appointment_time,
    a.status
FROM appointments a
INNER JOIN users c ON a.client_id = c.id
INNER JOIN lawyers l ON a.lawyer_id = l.id
INNER JOIN users l_user ON l.user_id = l_user.id
ORDER BY a.appointment_date DESC;

-- 1.2 LEFT JOIN: List all clients and their appointment history (including clients who have made no bookings)
SELECT 
    u.id AS client_id,
    u.name AS client_name,
    u.email,
    u.phone,
    a.id AS appointment_id,
    a.appointment_date,
    a.status
FROM users u
LEFT JOIN appointments a ON u.id = a.client_id
WHERE u.role = 'client'
ORDER BY u.id;

-- 1.3 RIGHT JOIN: List all registered lawyers and their appointments (lawyers with 0 bookings are preserved)
SELECT 
    l.id AS lawyer_id,
    u.name AS lawyer_name,
    l.specialization,
    l.district,
    a.id AS appointment_id,
    a.status AS appointment_status
FROM appointments a
RIGHT JOIN lawyers l ON a.lawyer_id = l.id
INNER JOIN users u ON l.user_id = u.id
ORDER BY l.id;

-- 1.4 FULL OUTER JOIN (Emulated in MySQL using UNION of LEFT and RIGHT JOINs)
-- Retrieves all users and all lawyers regardless of whether an appointment exists between them
SELECT 
    u.name AS person_name,
    u.role,
    l.specialization,
    a.id AS appointment_id,
    a.status
FROM users u
LEFT JOIN appointments a ON u.id = a.client_id
LEFT JOIN lawyers l ON a.lawyer_id = l.id

UNION

SELECT 
    u.name AS person_name,
    u.role,
    l.specialization,
    a.id AS appointment_id,
    a.status
FROM appointments a
RIGHT JOIN lawyers l ON a.lawyer_id = l.id
RIGHT JOIN users u ON l.user_id = u.id;

-- 1.5 NULL JOIN / ANTI-JOIN: Find registered lawyers who currently have NO appointment bookings
SELECT 
    l.id AS lawyer_id,
    u.name AS lawyer_name,
    l.specialization,
    l.district,
    l.consultation_fee
FROM lawyers l
INNER JOIN users u ON l.user_id = u.id
LEFT JOIN appointments a ON l.id = a.lawyer_id
WHERE a.id IS NULL;


-- ============================================================================
-- 2. SET OPERATIONS (UNION, INTERSECTION, DIFFERENCE)
-- ============================================================================

-- 2.1 UNION: Combine names & contact details of all Clients and Lawyers without duplicate entries
SELECT 
    name, 
    email, 
    phone, 
    'Client' AS role_category
FROM users 
WHERE role = 'client'

UNION

SELECT 
    name, 
    email, 
    phone, 
    'Lawyer' AS role_category
FROM users 
WHERE role = 'lawyer'
ORDER BY name ASC;

-- 2.2 INTERSECTION (Standard SQL INTERSECT / MySQL Supported in v8.0+)
-- Find distinct districts where both high-fee lawyers (> 2000 BDT) and active appointments exist
SELECT district FROM lawyers WHERE consultation_fee >= 2000
INTERSECT
SELECT l.district FROM appointments a JOIN lawyers l ON a.lawyer_id = l.id WHERE a.status = 'accepted';

-- 2.2.1 INTERSECTION (Universal MySQL Subquery / EXISTS equivalent)
SELECT DISTINCT l1.district
FROM lawyers l1
WHERE l1.consultation_fee >= 2000
  AND EXISTS (
      SELECT 1 
      FROM appointments a 
      JOIN lawyers l2 ON a.lawyer_id = l2.id 
      WHERE l2.district = l1.district AND a.status = 'accepted'
  );

-- 2.3 DIFFERENCE / EXCEPT (Standard SQL EXCEPT / MINUS / MySQL 8.0+)
-- Find districts that have registered lawyers, but currently have NO booked appointments
SELECT district FROM lawyers
EXCEPT
SELECT l.district FROM appointments a JOIN lawyers l ON a.lawyer_id = l.id;

-- 2.3.1 DIFFERENCE (Universal MySQL NOT IN / NOT EXISTS equivalent)
SELECT DISTINCT l.district
FROM lawyers l
WHERE l.district NOT IN (
    SELECT DISTINCT l2.district
    FROM appointments a
    JOIN lawyers l2 ON a.lawyer_id = l2.id
);


-- ============================================================================
-- 3. AGGREGATE FUNCTIONS & DIVISION
-- ============================================================================

-- 3.1 Core Aggregate Functions: COUNT, SUM, AVG, MIN, MAX with GROUP BY & HAVING
SELECT 
    l.specialization,
    COUNT(a.id) AS total_appointments,
    COUNT(DISTINCT a.client_id) AS unique_clients_served,
    COALESCE(SUM(l.consultation_fee), 0) AS total_revenue_generated,
    ROUND(AVG(l.consultation_fee), 2) AS average_consultation_fee,
    MIN(l.consultation_fee) AS min_fee,
    MAX(l.consultation_fee) AS max_fee,
    ROUND(AVG(l.rating), 2) AS average_rating
FROM lawyers l
LEFT JOIN appointments a ON l.id = a.lawyer_id
GROUP BY l.specialization
HAVING COUNT(a.id) >= 0
ORDER BY total_revenue_generated DESC;

-- 3.2 Mathematical Division: Revenue share percentage per specialization
SELECT 
    l.specialization,
    COUNT(a.id) AS appointment_count,
    SUM(l.consultation_fee) AS specialization_revenue,
    -- Division: (Specialization Revenue / Platform Total Revenue) * 100
    ROUND((SUM(l.consultation_fee) / (
        SELECT SUM(l2.consultation_fee) 
        FROM appointments a2 
        JOIN lawyers l2 ON a2.lawyer_id = l2.id
    )) * 100, 2) AS revenue_percentage_share
FROM appointments a
JOIN lawyers l ON a.lawyer_id = l.id
GROUP BY l.specialization;

-- 3.3 Relational Division: Find lawyers who have handled bookings across ALL distinct appointment statuses
-- (Relational Division using COUNT(DISTINCT) with a nested scalar divisor)
SELECT 
    l.id AS lawyer_id,
    u.name AS lawyer_name,
    l.specialization,
    COUNT(DISTINCT a.status) AS handled_status_count
FROM lawyers l
JOIN users u ON l.user_id = u.id
JOIN appointments a ON l.id = a.lawyer_id
GROUP BY l.id, u.name, l.specialization
HAVING COUNT(DISTINCT a.status) = (
    SELECT COUNT(DISTINCT status) FROM appointments
);


-- ============================================================================
-- 4. SUBQUERIES (SCALAR, CORRELATED, DERIVED TABLE, IN/EXISTS, CTE)
-- ============================================================================

-- 4.1 Scalar Subquery: Find lawyers whose consultation fee is higher than the platform average
SELECT 
    l.id AS lawyer_id,
    u.name AS lawyer_name,
    l.specialization,
    l.district,
    l.consultation_fee,
    (SELECT ROUND(AVG(consultation_fee), 2) FROM lawyers) AS platform_avg_fee,
    ROUND(l.consultation_fee - (SELECT AVG(consultation_fee) FROM lawyers), 2) AS fee_difference_above_avg
FROM lawyers l
JOIN users u ON l.user_id = u.id
WHERE l.consultation_fee > (SELECT AVG(consultation_fee) FROM lawyers)
ORDER BY l.consultation_fee DESC;

-- 4.2 Correlated Subquery: Find clients who have at least one 'accepted' or 'completed' consultation
SELECT 
    u.id AS client_id,
    u.name AS client_name,
    u.email,
    u.phone
FROM users u
WHERE u.role = 'client'
  AND EXISTS (
      SELECT 1 
      FROM appointments a 
      WHERE a.client_id = u.id 
        AND a.status IN ('accepted', 'completed')
  );

-- 4.3 Correlated Subquery with NOT EXISTS: Find clients who have NEVER booked an appointment
SELECT 
    u.id AS client_id,
    u.name AS client_name,
    u.email
FROM users u
WHERE u.role = 'client'
  AND NOT EXISTS (
      SELECT 1 
      FROM appointments a 
      WHERE a.client_id = u.id
  );

-- 4.4 Subquery in FROM Clause (Derived Table): Lawyer Performance Tier Analysis
SELECT 
    tier_summary.performance_tier,
    COUNT(tier_summary.lawyer_id) AS total_lawyers_in_tier,
    ROUND(AVG(tier_summary.consultation_fee), 2) AS avg_fee_in_tier,
    ROUND(AVG(tier_summary.rating), 2) AS avg_rating_in_tier
FROM (
    SELECT 
        id AS lawyer_id,
        consultation_fee,
        rating,
        CASE 
            WHEN rating >= 4.80 AND experience_years >= 8 THEN 'Top Tier / Veteran'
            WHEN rating >= 4.50 THEN 'Senior Practitioner'
            ELSE 'Associate'
        END AS performance_tier
    FROM lawyers
) AS tier_summary
GROUP BY tier_summary.performance_tier
ORDER BY avg_rating_in_tier DESC;

-- 4.5 Common Table Expression (CTE) & Subquery Filtering: Comprehensive Platform Analytics
WITH LawyerAppointmentStats AS (
    SELECT 
        l.id AS lawyer_id,
        u.name AS lawyer_name,
        l.specialization,
        l.district,
        COUNT(a.id) AS total_bookings,
        SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) AS completed_bookings,
        SUM(CASE WHEN a.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_bookings,
        COALESCE(SUM(CASE WHEN a.status = 'completed' THEN l.consultation_fee ELSE 0 END), 0) AS realized_revenue
    FROM lawyers l
    JOIN users u ON l.user_id = u.id
    LEFT JOIN appointments a ON l.id = a.lawyer_id
    GROUP BY l.id, u.name, l.specialization, l.district
)
SELECT 
    las.lawyer_id,
    las.lawyer_name,
    las.specialization,
    las.district,
    las.total_bookings,
    las.completed_bookings,
    las.cancelled_bookings,
    las.realized_revenue,
    -- Division: Completion rate percentage
    CASE 
        WHEN las.total_bookings > 0 
        THEN ROUND((las.completed_bookings / las.total_bookings) * 100, 1)
        ELSE 0.0
    END AS completion_rate_percent
FROM LawyerAppointmentStats las
WHERE las.lawyer_id IN (
    SELECT id FROM lawyers WHERE rating >= 4.50
)
ORDER BY las.realized_revenue DESC, las.total_bookings DESC;
