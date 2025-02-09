<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Brand extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'photo',
    ];

    public function setNameAttribute($value)
    {
        $this->attributes['name'] = $value;
        $this->attributes['slug'] = Str::slug($value);
    }

    public function items(): HasMany
    {
        return $this->hasMany(Item::class);
    }

    public function popularItems(): HasMany
    {
        return $this->hasMany(Item::class)->where('is_popular', true)->orderBy('created_at', 'desc');
    }
}
