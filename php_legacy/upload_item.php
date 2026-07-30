<?php
header("Content-Type: application/json");
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $target_dir = "uploads/";
    if (!file_exists($target_dir)) { mkdir($target_dir, 0777, true); }
    
    $target_file = $target_dir . basename($_FILES["file"]["name"]);
    if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
        echo json_encode([
            "status" => "Success",
            "url" => "/legacy/" . $target_file
        ]);
        exit();
    }
}
echo json_encode(["status" => "Upload failed"]);
?>