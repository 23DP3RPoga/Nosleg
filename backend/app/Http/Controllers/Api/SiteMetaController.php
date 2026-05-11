<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class SiteMetaController extends Controller
{
    /**
     * Public inbox hint for contact page (same mailbox that receives support form + verification sender).
     */
    public function contact(): JsonResponse
    {
        $email = (string) (config('mail.support_inbox') ?: config('mail.from.address'));

        return response()->json([
            'support_email' => $email,
        ]);
    }
}
