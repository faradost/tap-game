<?php
$host = 'localhost';
$user = 'root';
$password = '';  // رمز عبور MySQL خود را وارد کنید اگر دارد
$dbname = 'game_db';

// ایجاد اتصال به پایگاه داده
$conn = new mysqli($host, $user, $password, $dbname);

// بررسی اتصال
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// تعیین charset
$conn->set_charset("utf8");
?>
