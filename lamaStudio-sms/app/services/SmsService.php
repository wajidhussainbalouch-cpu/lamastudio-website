<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class SmsService
{
    public static function sendSms($phone, $message)
    {
        // Example integration layout for standard Pakistani HTTP SMS APIs
        $apiKey = config('services.sms.api_key', 'YOUR_SMS_API_KEY');
        $senderId = config('services.sms.sender_id', 'LamaStudio');

        // Clean phone number format (ensuring standard 92XXXXXXXXXX)
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Send request to local gateway API endpoint
        try {
            $response = Http::get('https://api.sms-gateway.pk/v1/send', [
                'api_key' => $apiKey,
                'sender' => $senderId,
                'number' => $phone,
                'message' => $message,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            // Fallback or error log if network fails
            return false;
        }
    }
}