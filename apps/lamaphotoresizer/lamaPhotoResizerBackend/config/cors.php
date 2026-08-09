<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],

    // Replace with your real frontend origin(s) once deployed.
    'allowed_origins' => [
        'https://lamastudio.pk',
        'https://www.lamastudio.pk',
        'http://localhost:8080', // local `python3 -m http.server` while testing
    ],

    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,

    // Token auth (Authorization: Bearer ...) doesn't need cookies, so this
    // stays false — flip to true only if you switch to Sanctum's SPA
    // cookie-session mode instead of bearer tokens.
    'supports_credentials' => false,
];
