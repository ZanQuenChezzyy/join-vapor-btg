<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\ItemApiResource;
use App\Models\Item;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public function index(Request $request)
    {
        $item = Item::with(['Brand', 'Category']);

        if ($request->has('category_id')) {
            $item->where('category_id', $request->input('category_id'));
        }
        if ($request->has('brand_id')) {
            $item->where('brand_id', $request->input('brand_id'));
        }
        if ($request->has('is_popular')) {
            $item->where('is_popular', $request->input('is_popular'));
        }
        if ($request->has('limit')) {
            $item->limit($request->input('limit'));
        }

        return ItemApiResource::collection($item->get());
    }

    public function show(Item $item)
    {
        $item->load(['Category', 'Brand', 'itemPhotos', 'itemSpecifications', 'itemTestimonials']);

        return new ItemApiResource($item);
    }
}
