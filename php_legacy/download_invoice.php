<?php
$file = $_GET['file'] ?? '';

if (!empty($file)) {
    $filepath = "/var/www/html/" . $file;
    if (file_exists($filepath)) {
        echo file_get_contents($filepath);
        exit();
    } else {
        echo "File error: Not found.";
        exit();
    }
}
echo "Please specify a ?file= parameter.";
?>