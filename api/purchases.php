<?php
require "config.php";
header('Content-Type: application/json');

if (session_status() === PHP_SESSION_NONE) session_start();

if (empty($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "error" => "Not authenticated"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            id, 
            total, 
            status, 
            created_at, 
            updated_at
        FROM orders 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $orders = $stmt->fetchAll();

    // Get items for each order
    foreach ($orders as &$order) {
        $stmtItems = $pdo->prepare("
            SELECT 
                product_name, 
                quantity, 
                price
            FROM order_items 
            WHERE order_id = ?
        ");
        $stmtItems->execute([$order['id']]);
        $order['items'] = $stmtItems->fetchAll();
    }

    echo json_encode(["success" => true, "purchases" => $orders]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
