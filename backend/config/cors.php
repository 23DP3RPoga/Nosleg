<?php

// Browsers treat http://localhost:8080 and http://127.0.0.1:8080 as different origins — allow both for local dev.
$extra = array_filter(array_map('trim', explode(',', (string) env('CORS_ALLOWED_ORIGINS', ''))));

$allowed = array_values(array_unique(array_filter(array_merge(
    [
        rtrim((string) env('FRONTEND_URL', 'http://localhost:8080'), '/'),
        'http://localhost:8080',
        'http://127.0.0.1:8080',
    ],
    $extra,
))));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $allowed,
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
