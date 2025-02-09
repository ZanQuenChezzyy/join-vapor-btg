<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBillingDetailRequest;
use App\Http\Resources\Api\BillingDetailApiResource;
use App\Models\BillingDetail;
use App\Models\Item;
use Illuminate\Http\Request;

class BillingDetailController extends Controller
{
    public function store(StoreBillingDetailRequest $request)
    {
        try {
            $validatedData = $request->validated();

            if ($request->hasFile('payment_proof')) {
                $filePath = $request->file('payment_proof')->store('payment_proof', 'public');
                $validatedData['payment_proof'] = $filePath;
            }

            $products = $request->input('item_ids');
            $totalQuantity = 0;
            $totalPrice = 0;

            $itemIds = array_column($products, 'id');
            $items = Item::whereIn('id', $itemIds)->get();

            foreach ($products as $product) {
                $item = $items->firstWhere('id', $product['id']);
                $totalQuantity += $product['quantity'];
                $totalPrice += $item->price * $product['quantity'];
            }

            $tax = 0.003 * $totalPrice;
            $grandTotal = $totalPrice + $tax;

            $validatedData['quantity'] = $totalQuantity;
            $validatedData['sub_total_amount'] = $totalPrice;
            $validatedData['total_tax_amount'] = $tax;
            $validatedData['total_amount'] = $grandTotal;
            $validatedData['is_paid'] = false;
            $validatedData['on_store'] = false;
            $validatedData['item_trx_id'] = BillingDetail::generateUniqueTrxId();

            $billingDetail = BillingDetail::create($validatedData);

            foreach ($products as $product) {
                $item = $items->firstWhere('id', $product['id']);
                $billingDetail->transactionDetails()->create([
                    'item_id' => $product['id'],
                    'quantity' => $product['quantity'],
                    'price' => $item->price,
                ]);
            }

            return new BillingDetailApiResource($billingDetail->load(['transactionDetails', 'transactionDetails.item']));
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occured', 'error' => $e->getMessage()], 500);
        }
    }

    public function transaction_details(Request $request)
    {
        $request->validate([
            'email' => 'required|email|string|min:3|max:45',
            'item_trx_id' => 'required|string|min:5|max:12',
        ]);

        $billing = BillingDetail::where('email', $request->email)
            ->where('item_trx_id', $request->item_trx_id)
            ->with([
                'transactionDetails',
                'transactionDetails.item',
            ])
            ->first();

        if (!$billing) {
            return response()->json(['message' => 'Transaksi Tidak Ditemukan'], 404);
        }
        return new BillingDetailApiResource($billing);
    }
}
