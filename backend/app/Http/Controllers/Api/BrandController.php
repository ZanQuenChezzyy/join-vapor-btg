<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\BrandApiResource;
use App\Models\Brand;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    public function index(Request $request)
    {
        $categories = Brand::withCount(['items' => function($query) {
            $query->where('is_displayed', true);
        }]);;

        if ($request->has('limit')) {
            $categories->limit($request->input('limit'));
        }

        return BrandApiResource::collection($categories->get());
    }

    public function show(Brand $brand)
    {
        $brand->load(['items' => function($query) {
            $query->where('is_displayed', true);
        }, 'popularItems']);

        $brand->loadCount(['items' => function($query) {
            $query->where('is_displayed', true);
        }]);

        return new BrandApiResource($brand);
    }
}
