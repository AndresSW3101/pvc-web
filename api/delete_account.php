<?php
require "config.php";
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit;
}

if (session_status() === PHP_SESSION_NONE) session_start();

if (empty($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "error" => "Not authenticated"]);
    exit;
}

try {
    $user_id = $_SESSION['user_id'];
    
    // Delete user's orders first
    $stmtOrders = $pdo->prepare("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)");
    $stmtOrders->execute([$user_id]);
    
    $stmtOrders = $pdo->prepare("DELETE FROM orders WHERE user_id = ?");
    $stmtOrders->execute([$user_id]);
    
    // Delete user
    $stmtUser = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmtUser->execute([$user_id]);
    
    // Destroy session
    session_destroy();
    
    echo json_encode(["success" => true, "message" => "Account deleted successfully"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
