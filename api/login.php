<?php
require "config.php";

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data) || empty($data['email']) || empty($data['password'])) {
    echo json_encode(["success" => false, "error" => "Missing credentials"]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$data['email']]);

    $user = $stmt->fetch();

    if ($user && password_verify($data['password'], $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        echo json_encode(["success" => true, "name" => $user['name']]);
    } else {
        echo json_encode(["success" => false, "error" => "Invalid credentials"]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
