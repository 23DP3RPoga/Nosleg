<?php

$allowed = array_values(array_unique(array_filter([
    rtrim((string) env('FRONTEND_URL', 'http://localhost:8080'), '/'),
    'http://localhost:8080',
    'http://127.0.0.1:8080',
])));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $allowed,
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,  // ← changed from false
];