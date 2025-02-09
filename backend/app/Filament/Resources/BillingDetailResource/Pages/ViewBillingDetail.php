<?php

namespace App\Filament\Resources\BillingDetailResource\Pages;

use App\Filament\Resources\BillingDetailResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewBillingDetail extends ViewRecord
{
    protected static string $resource = BillingDetailResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
