<?php
require "config.php";

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    echo json_encode(["success" => false, "error" => "Invalid JSON input"]);
    exit;
}

$name  = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$password_raw = $data['password'] ?? '';
$phone = $data['phone'] ?? null;

if ($name === '' || $email === '' || $password_raw === '') {
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

try {
    // Check if email already exists
    $check = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $check->execute([$email]);
    if ($check->fetch()) {
        echo json_encode(["success" => false, "error" => "Email already registered"]);
        exit;
    }

    $pass = password_hash($password_raw, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare(
        "INSERT INTO users (name, email, password, phone)
         VALUES (?, ?, ?, ?)"
    );

    $stmt->execute([$name, $email, $pass, $phone]);

    echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
