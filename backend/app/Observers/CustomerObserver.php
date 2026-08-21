<?php

namespace App\Observers;

use App\Models\Customer;
use App\Services\ElasticsearchService;
use Illuminate\Support\Facades\Log;

class CustomerObserver
{
    public function __construct(
        private readonly ElasticsearchService $elasticsearchService
    ) {}

    /**
     * Handle the Customer "created" event.
     * Indexes the new customer document in Elasticsearch.
     */
    public function created(Customer $customer): void
    {
        $this->syncToElasticsearch($customer);
    }

    /**
     * Handle the Customer "updated" event.
     * Re-indexes the updated customer document in Elasticsearch.
     */
    public function updated(Customer $customer): void
    {
        $this->syncToElasticsearch($customer);
    }

    /**
     * Handle the Customer "deleted" event.
     * Removes the customer document from Elasticsearch.
     */
    public function deleted(Customer $customer): void
    {
        $deleted = $this->elasticsearchService->deleteDocument($customer->id);

        if (!$deleted) {
            Log::warning("[CustomerObserver] Failed to delete ES document for customer ID {$customer->id}.");
        }
    }

    /**
     * Sync the customer record to Elasticsearch.
     */
    private function syncToElasticsearch(Customer $customer): void
    {
        $indexed = $this->elasticsearchService->indexDocument($customer->id, [
            'first_name'     => $customer->first_name,
            'last_name'      => $customer->last_name,
            'email'          => $customer->email,
            'contact_number' => $customer->contact_number,
        ]);

        if (!$indexed) {
            Log::warning("[CustomerObserver] Failed to sync customer ID {$customer->id} to Elasticsearch.");
        }
    }
}
