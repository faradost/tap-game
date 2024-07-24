<?php
header('Content-Type: application/json');

$host = 'localhost';
$user = 'root';
$password = '';  // رمز عبور MySQL خود را وارد کنید اگر دارد
$dbname = 'game_db';

$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

if (!isset($_POST['username'])) {
    die(json_encode(['success' => false, 'message' => 'اطلاعات کامل نیست.']));
}

$username = $_POST['username'];

// بررسی وجود کاربر
$sql_check = "SELECT * FROM users WHERE username = ?";
$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param('s', $username);
$stmt_check->execute();
$result = $stmt_check->get_result();

if ($result->num_rows > 0) {
    echo json_encode(['success' => true, 'message' => 'نام کاربری معتبر است.']);
} else {
    // ایجاد کاربر جدید
    $sql_insert = "INSERT INTO users (username, score, level, created_at, updated_at) VALUES (?, 0, 1, NOW(), NOW())";
    $stmt_insert = $conn->prepare($sql_insert);
    $stmt_insert->bind_param('s', $username);
    $stmt_insert->execute();

    if ($stmt_insert->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'نام کاربری جدید ایجاد شد.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'خطا در ایجاد نام کاربری.']);
    }
    $stmt_insert->close();
}

$stmt_check->close();
$conn->close();
?>
