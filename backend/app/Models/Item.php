<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'brand_id',
        'name',
        'slug',
        'thumbnail',
        'stock',
        'price',
        'description',
        'is_popular',
        'is_displayed',
        'avg_rating',
    ];

    public function setNameAttribute($value)
    {
        $this->attributes['name'] = $value;
        $this->attributes['slug'] = Str::slug($value);
    }

    public function updateTotalRating()
    {
        // Hitung rata-rata rating dengan dua angka desimal
        $averageRating = round($this->itemTestimonials()->avg('rating'), 2);

        // Simpan rata-rata rating ke kolom avg_rating
        $this->update([
            'avg_rating' => $averageRating ?? 0
        ]);
    }

    public function Category(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Category::class, 'category_id', 'id');
    }


    public function Brand(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Brand::class, 'brand_id', 'id');
    }

    public function itemPhotos(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Models\ItemPhoto::class);
    }


    public function itemSpecifications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Models\ItemSpecification::class);
    }


    public function itemTestimonials(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Models\ItemTestimonial::class);
    }


    public function transactionDetails(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Models\TransactionDetail::class);
    }
}
