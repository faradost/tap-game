<?php
// اتصال به پایگاه داده
include('db_connection.php'); 

// Check if username is set in POST data
if (!isset($_POST['username'])) {
    die(json_encode(['success' => false, 'message' => 'نام کاربری دریافت نشد.']));
}

// Retrieve username from POST data
$username = $_POST['username'];

// Prepare SQL statement
$sql = "INSERT INTO users (username) VALUES (?) ON DUPLICATE KEY UPDATE username = ?";
$stmt = $conn->prepare($sql);

// Bind parameters
$stmt->bind_param('ss', $username, $username);

// Execute SQL statement
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'نام کاربری با موفقیت ذخیره شد.']);
} else {
    echo json_encode(['success' => false, 'message' => 'خطا در ذخیره نام کاربری: ' . $conn->error]);
}

// Close statement and connection
$stmt->close();
$conn->close();
?>
