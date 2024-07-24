<?php
// اتصال به پایگاه داده
include('db_connection.php'); 

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['username'];

    if (!empty($username)) {
        // بارگذاری امتیاز و سطح از پایگاه داده
        $stmt = $conn->prepare("SELECT score, level FROM users WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $stmt->bind_result($score, $level);
        $stmt->fetch();
        $stmt->close();

        if ($score !== null && $level !== null) {
            echo json_encode(["score" => $score, "level" => $level]);
        } else {
            echo json_encode(["score" => 0, "level" => 1]);
        }
    } else {
        echo json_encode(["error" => "Username is required"]);
    }
}
?>
