<?php
$host = "localhost";
$db   = "pvg_shop";
$user = "root";
$pass = "";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(["success" => false, "error" => "Error de conexión to DB: " . $e->getMessage()]);
    exit;
}

session_start();
