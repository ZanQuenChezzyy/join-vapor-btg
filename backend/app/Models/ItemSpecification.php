<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemSpecification extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'name',
    ];

    public function Item(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Item::class, 'item_id', 'id');
    }
}
