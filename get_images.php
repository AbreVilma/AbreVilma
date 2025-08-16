<?php
// get_images.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

function getImagesFromFolder($folderPath) {
    $images = [];
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (is_dir($folderPath)) {
        $files = scandir($folderPath);
        
        foreach ($files as $file) {
            if ($file != "." && $file != "..") {
                $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                
                if (in_array($extension, $allowedExtensions)) {
                    $images[] = $file;
                }
            }
        }
        
        // Ordenar las imágenes naturalmente (1.jpg, 2.jpg, 10.jpg, etc.)
        natsort($images);
        $images = array_values($images); // Reindexar el array
    }
    
    return $images;
}

// Estructura de carpetas
$categories = [
    'novias' => 'img/novias/',
    'madrinas' => 'img/madrinas/',
    'invitadas' => 'img/invitadas/'
];

$result = [];

foreach ($categories as $category => $path) {
    $images = getImagesFromFolder($path);
    $result[$category] = [
        'count' => count($images),
        'images' => $images
    ];
}

echo json_encode($result, JSON_PRETTY_PRINT);
?>