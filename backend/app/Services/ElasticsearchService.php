<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ElasticsearchService
{
    private string $host;
    private string $index;

    public function __construct()
    {
        $this->host  = rtrim(config('services.elasticsearch.host', 'http://searcher:9200'), '/');
        $this->index = config('services.elasticsearch.index', 'customers');
    }

    /**
     * Create the Elasticsearch index with field mappings.
     * Safe to call multiple times — skips if index already exists.
     */
    public function createIndex(): bool
    {
        // Check if index already exists
        $response = Http::get("{$this->host}/{$this->index}");

        if ($response->successful()) {
            Log::info("[Elasticsearch] Index '{$this->index}' already exists. Skipping creation.");
            return true;
        }

        $response = Http::put("{$this->host}/{$this->index}", [
            'mappings' => [
                'properties' => [
                    'first_name'     => ['type' => 'text'],
                    'last_name'      => ['type' => 'text'],
                    'email'          => [
                        'type'   => 'text',
                        'fields' => [
                            'keyword' => ['type' => 'keyword'],
                        ],
                    ],
                    'contact_number' => ['type' => 'keyword'],
                ],
            ],
        ]);

        if ($response->successful()) {
            Log::info("[Elasticsearch] Index '{$this->index}' created successfully.");
            return true;
        }

        Log::error("[Elasticsearch] Failed to create index '{$this->index}'.", [
            'status'   => $response->status(),
            'response' => $response->body(),
        ]);

        return false;
    }

    /**
     * Index (upsert) a customer document in Elasticsearch.
     *
     * @param array<string, mixed> $data
     */
    public function indexDocument(int $id, array $data): bool
    {
        try {
            $response = Http::put("{$this->host}/{$this->index}/_doc/{$id}", $data);

            if ($response->successful()) {
                return true;
            }

            Log::error("[Elasticsearch] Failed to index document ID {$id}.", [
                'status'   => $response->status(),
                'response' => $response->body(),
            ]);

            return false;
        } catch (ConnectionException $e) {
            Log::error("[Elasticsearch] Connection error when indexing document ID {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete a customer document from Elasticsearch.
     */
    public function deleteDocument(int $id): bool
    {
        try {
            $response = Http::delete("{$this->host}/{$this->index}/_doc/{$id}");

            // 200 (deleted) or 404 (already gone) are both acceptable
            if ($response->successful() || $response->status() === 404) {
                return true;
            }

            Log::error("[Elasticsearch] Failed to delete document ID {$id}.", [
                'status'   => $response->status(),
                'response' => $response->body(),
            ]);

            return false;
        } catch (ConnectionException $e) {
            Log::error("[Elasticsearch] Connection error when deleting document ID {$id}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Search for customers by name or email using a multi-match query.
     *
     * @return array<int, int> Array of matching customer IDs
     */
    public function search(string $query, int $size = 100): array
    {
        try {
            $response = Http::post("{$this->host}/{$this->index}/_search", [
                'size'  => $size,
                'query' => [
                    'multi_match' => [
                        'query'     => $query,
                        'fields'    => ['first_name', 'last_name', 'email'],
                        'type'      => 'best_fields',
                        'fuzziness' => 'AUTO',
                    ],
                ],
            ]);

            if (!$response->successful()) {
                Log::error("[Elasticsearch] Search query failed.", [
                    'status'   => $response->status(),
                    'response' => $response->body(),
                ]);
                return [];
            }

            $hits = $response->json('hits.hits', []);

            // Return array of document IDs (which match our MySQL customer IDs)
            return array_map(fn($hit) => (int) $hit['_id'], $hits);
        } catch (ConnectionException $e) {
            Log::error("[Elasticsearch] Connection error during search: " . $e->getMessage());
            return [];
        }
    }
}
