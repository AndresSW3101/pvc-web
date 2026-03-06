<?php
require "config.php";

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$stmt = $pdo->prepare(
    "INSERT INTO cart (user_id, product_id, color, quantity)
     VALUES (?, ?, ?, ?)"
);

$stmt->execute([
    $_SESSION['user_id'],
    $data['product_id'],
    $data['color'],
    $data['quantity']
]);

echo json_encode(["success" => true]);
