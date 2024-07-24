<?php
$host = 'localhost';
$user = 'root';
$password = '';  // رمز عبور MySQL خود را وارد کنید اگر دارد
$dbname = 'game_db';

$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

if (!isset($_GET['username'])) {
    die(json_encode(['success' => false, 'message' => 'نام کاربری دریافت نشد.']));
}

$username = $_GET['username'];

$sql = "SELECT id FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $username);
$stmt->execute();
$stmt->store_result();
$stmt->bind_result($userId);
$stmt->fetch();

if ($stmt->num_rows === 0) {
    die(json_encode(['success' => false, 'message' => 'کاربری با این نام کاربری یافت نشد.']));
}

$sql = "SELECT COUNT(*) FROM referrals WHERE inviter_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $userId);
$stmt->execute();
$stmt->bind_result($friendsInvited);
$stmt->fetch();

echo json_encode(['success' => true, 'friendsInvited' => $friendsInvited]);

$stmt->close();
$conn->close();
?>
