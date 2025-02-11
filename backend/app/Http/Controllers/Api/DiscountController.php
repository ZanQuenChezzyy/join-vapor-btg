<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use Illuminate\Http\Request;

class DiscountController extends Controller
{
    public function getDiscount($code)
    {
        // Cari diskon berdasarkan kode yang valid
        $discount = Discount::where('code', $code)
            ->where('is_active', true)
            ->whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now())
            ->first();

        if (!$discount) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kode diskon tidak ditemukan atau tidak berlaku'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $discount, // return the whole discount model
        ], 200);
    }
}
