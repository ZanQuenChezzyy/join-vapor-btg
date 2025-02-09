<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBillingDetailRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|min:3|max:45',
            'phone' => 'required|string|min:11|max:15',
            'email' => 'required|string|email|min:8|max:45',
            'city' => 'required|string|min:3|max:45',
            'address' => 'required|string|min:10',
            'post_code' => 'required|numeric|min_digits:5|max_digits:5',
            'payment_proof' => 'required|file|mimes:png,jpg, jpeg|max:2048',
            'item_ids' => 'required|array',
            'item_ids.*.id' => 'required|integer|exists:items,id',
            'item_ids.*.quantity' => 'required|integer|min_digits:1|max_digits:999'
        ];
    }
}
