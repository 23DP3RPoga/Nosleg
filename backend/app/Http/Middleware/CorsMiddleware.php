<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    private const ALLOWED_METHODS = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';

    private const ALLOWED_HEADERS = 'Content-Type, Authorization, X-Requested-With';

    public function handle(Request $request, Closure $next)
    {
        $origin = $request->headers->get('Origin');
        $allowed = config('cors.allowed_origins', []);

        if (! in_array($origin, $allowed, true)) {
            return $next($request);
        }

        if ($request->isMethod('OPTIONS')) {
            return response('', 204)
                ->header('Access-Control-Allow-Origin', $origin)
                ->header('Access-Control-Allow-Methods', self::ALLOWED_METHODS)
                ->header('Access-Control-Allow-Headers', self::ALLOWED_HEADERS)
                ->header('Access-Control-Allow-Credentials', 'true');
        }

        return $next($request)
            ->header('Access-Control-Allow-Origin', $origin)
            ->header('Access-Control-Allow-Methods', self::ALLOWED_METHODS)
            ->header('Access-Control-Allow-Headers', self::ALLOWED_HEADERS)
            ->header('Access-Control-Allow-Credentials', 'true');
    }
}