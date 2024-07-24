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

$sql = "SELECT score, level FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo json_encode(['success' => true, 'data' => $row]);
} else {
    echo json_encode(['success' => false, 'message' => 'کاربری با این نام یافت نشد.']);
}

$stmt->close();
$conn->close();
?>
