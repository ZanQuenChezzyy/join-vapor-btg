<?php

use App\Http\Controllers\Api\BillingDetailController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ItemController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/item/{item:slug}', [ItemController::class, 'show']);
Route::apiResource('/items', ItemController::class);

Route::get('/category/{category:slug}', [CategoryController::class, 'show']);
Route::apiResource('/categories', CategoryController::class);

Route::get('/brand/{brand:slug}', [BrandController::class, 'show']);
Route::apiResource('/brands', BrandController::class);

Route::post('/billing-detail', [BillingDetailController::class, 'store']);
Route::post('/check-transaction', [BillingDetailController::class, 'transaction_details']);
Route::post('/check-discount', [BillingDetailController::class,'check_discount']);
