<?php

namespace App\Console\Commands;

use App\Services\ElasticsearchService;
use Illuminate\Console\Command;

class SetupElasticsearch extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'elasticsearch:setup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create the Elasticsearch index with the required field mappings for customers.';

    public function __construct(
        private readonly ElasticsearchService $elasticsearchService
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Setting up Elasticsearch index...');

        $success = $this->elasticsearchService->createIndex();

        if ($success) {
            $this->info('Elasticsearch index is ready.');
            return Command::SUCCESS;
        }

        $this->error('Failed to set up Elasticsearch index. Check logs for details.');
        return Command::FAILURE;
    }
}
