<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    /**
     * Inbox for support form submissions — same as verification "from" unless MAIL_SUPPORT_INBOX is set.
     */
    public function submit(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'max:200'],
            'message' => ['required', 'string', 'max:10000'],
        ]);

        $to = (string) (config('mail.support_inbox') ?: config('mail.from.address'));

        $body = "Kontakts no Vitalo vietnes formas\n\n";
        $body .= 'Vārds: '.$data['name']."\n";
        $body .= 'E-pasts: '.$data['email']."\n";
        $body .= 'Tēma: '.$data['subject']."\n\n";
        $body .= "Ziņa:\n".$data['message']."\n";

        try {
            Mail::raw($body, function ($message) use ($data, $to) {
                $message->to($to)
                    ->subject('[Vitalo atbalsts] '.$data['subject'])
                    ->replyTo($data['email'], $data['name']);
            });
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Neizdevās nosūtīt ziņu. Pārbaudi pasta iestatījumus (MAIL_*) serverī.',
            ], 503);
        }

        return response()->json([
            'message' => 'Paldies! Ziņa ir nosūtīta. Atbildēsim tuvākajā laikā.',
        ], 202);
    }
}
