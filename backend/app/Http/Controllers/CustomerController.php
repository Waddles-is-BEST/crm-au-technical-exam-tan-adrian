<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Services\ElasticsearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CustomerController extends Controller
{
    public function __construct(
        private readonly ElasticsearchService $elasticsearchService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = (int) $request->get('per_page', 15);
        $search  = $request->get('search', '');

        if (!empty($search)) {
            $ids = $this->elasticsearchService->search($search);

            if (empty($ids)) {
                return CustomerResource::collection(
                    Customer::whereRaw('0 = 1')->paginate($perPage)
                );
            }

            $customers = Customer::whereIn('id', $ids)
                ->orderByRaw('FIELD(id, ' . implode(',', $ids) . ')')
                ->paginate($perPage);
        } else {
            $customers = Customer::orderBy('created_at', 'desc')->paginate($perPage);
        }

        return CustomerResource::collection($customers);
    }

    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $customer = Customer::create($request->validated());

        return response()->json([
            'data'    => new CustomerResource($customer),
            'message' => 'Customer created successfully.',
        ], 201);
    }

    public function show(Customer $customer): CustomerResource
    {
        return new CustomerResource($customer);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): JsonResponse
    {
        $customer->update($request->validated());

        return response()->json([
            'data'    => new CustomerResource($customer->fresh()),
            'message' => 'Customer updated successfully.',
        ]);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();

        return response()->json([
            'message' => 'Customer deleted successfully.',
        ]);
    }
}
