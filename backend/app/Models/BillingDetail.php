<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BillingDetail extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'city',
        'post_code',
        'quantity',
        'total_amount',
        'sub_total_amount',
        'total_tax_amount',
        'on_store',
        'item_trx_id',
        'discount_id',
        'discount_amount',
        'payment_proof',
        'is_paid',
    ];

    public static function generateUniqueTrxId()
    {
        $prefix = 'JOINVPR';
        do {
            $randomString = $prefix . mt_rand(1000, 9999);
        } while (self::where('item_trx_id', $randomString)->exists());

        return $randomString;
    }

    public function transactionDetails(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Models\TransactionDetail::class);
    }

    public function Discount(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Discount::class, 'discount_id', 'id');
    }
}
