<?php

namespace App\Observers;

use App\Models\ItemTestimonial;

class ItemTestimonialObserver
{
    /**
     * Handle the ItemTestimonial "created" event.
     */
    public function created(ItemTestimonial $itemTestimonial): void
    {
        $itemTestimonial->Item->updateTotalRating();
    }

    /**
     * Handle the ItemTestimonial "updated" event.
     */
    public function updated(ItemTestimonial $itemTestimonial): void
    {
        $itemTestimonial->Item->updateTotalRating();
    }

    /**
     * Handle the ItemTestimonial "deleted" event.
     */
    public function deleted(ItemTestimonial $itemTestimonial): void
    {
        $itemTestimonial->Item->updateTotalRating();
    }

    /**
     * Handle the ItemTestimonial "restored" event.
     */
    public function restored(ItemTestimonial $itemTestimonial): void
    {
        //
    }

    /**
     * Handle the ItemTestimonial "force deleted" event.
     */
    public function forceDeleted(ItemTestimonial $itemTestimonial): void
    {
        //
    }
}
