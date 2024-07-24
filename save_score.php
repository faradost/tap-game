<?php
// اتصال به پایگاه داده
include('db_connection.php'); 

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['username'];
    $score = $_POST['score'];
    $level = $_POST['level'];

    if (!empty($username) && is_numeric($score) && is_numeric($level)) {
        // ذخیره امتیاز و سطح در پایگاه داده
        $stmt = $conn->prepare("UPDATE users SET score = ?, level = ? WHERE username = ?");
        $stmt->bind_param("iis", $score, $level, $username);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            echo json_encode(["success" => true]);
        } else {
            // اگر بروزرسانی نشد، ممکن است کاربر وجود نداشته باشد
            echo json_encode(["success" => false, "message" => "Failed to update score. User may not exist."]);
        }
        $stmt->close();
    } else {
        echo json_encode(["success" => false, "message" => "Invalid input"]);
    }
}
?>
