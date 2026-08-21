<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Services\ElasticsearchService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery\MockInterface;
use Tests\TestCase;

class CustomerApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Mock the ElasticsearchService so no real ES calls are made in tests.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Mock ES service — always return success so observer doesn't fail
        $this->mock(ElasticsearchService::class, function (MockInterface $mock) {
            $mock->shouldReceive('indexDocument')->andReturn(true);
            $mock->shouldReceive('deleteDocument')->andReturn(true);
            $mock->shouldReceive('search')->andReturn([]);
        });
    }

    // ──────────────────────────────────────────────
    // LIST
    // ──────────────────────────────────────────────

    public function test_can_list_all_customers(): void
    {
        Customer::factory()->count(3)->create();

        $response = $this->getJson('/api/customers');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [['id', 'first_name', 'last_name', 'email', 'contact_number']],
                     'meta',
                 ]);
    }

    // ──────────────────────────────────────────────
    // CREATE
    // ──────────────────────────────────────────────

    public function test_can_create_a_customer(): void
    {
        $payload = [
            'first_name'     => 'John',
            'last_name'      => 'Doe',
            'email'          => 'john.doe@example.com',
            'contact_number' => '63912345678',
        ];

        $response = $this->postJson('/api/customers', $payload);

        $response->assertStatus(201)
                 ->assertJsonPath('data.email', 'john.doe@example.com')
                 ->assertJsonPath('message', 'Customer created successfully.');

        $this->assertDatabaseHas('customers', ['email' => 'john.doe@example.com']);
    }

    public function test_create_requires_first_name(): void
    {
        $response = $this->postJson('/api/customers', [
            'last_name' => 'Doe',
            'email'     => 'test@example.com',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['first_name']);
    }

    public function test_create_requires_last_name(): void
    {
        $response = $this->postJson('/api/customers', [
            'first_name' => 'John',
            'email'      => 'test@example.com',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['last_name']);
    }

    public function test_create_requires_unique_email(): void
    {
        Customer::factory()->create(['email' => 'existing@example.com']);

        $response = $this->postJson('/api/customers', [
            'first_name' => 'Jane',
            'last_name'  => 'Doe',
            'email'      => 'existing@example.com',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    public function test_create_requires_valid_email_format(): void
    {
        $response = $this->postJson('/api/customers', [
            'first_name' => 'John',
            'last_name'  => 'Doe',
            'email'      => 'not-an-email',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    public function test_create_rejects_non_numeric_contact_number(): void
    {
        $response = $this->postJson('/api/customers', [
            'first_name'     => 'John',
            'last_name'      => 'Doe',
            'email'          => 'contact@example.com',
            'contact_number' => '+63912345678',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['contact_number']);
    }

    public function test_create_rejects_contact_number_longer_than_15_digits(): void
    {
        $response = $this->postJson('/api/customers', [
            'first_name'     => 'John',
            'last_name'      => 'Doe',
            'email'          => 'long-contact@example.com',
            'contact_number' => '1234567890123456',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['contact_number']);
    }

    // ──────────────────────────────────────────────
    // SHOW
    // ──────────────────────────────────────────────

    public function test_can_view_a_customer(): void
    {
        $customer = Customer::factory()->create();

        $response = $this->getJson("/api/customers/{$customer->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('data.id', $customer->id)
                 ->assertJsonPath('data.email', $customer->email);
    }

    public function test_returns_404_for_unknown_customer(): void
    {
        $response = $this->getJson('/api/customers/99999');

        $response->assertStatus(404);
    }

    // ──────────────────────────────────────────────
    // UPDATE
    // ──────────────────────────────────────────────

    public function test_can_update_a_customer(): void
    {
        $customer = Customer::factory()->create(['email' => 'old@example.com']);

        $response = $this->putJson("/api/customers/{$customer->id}", [
            'first_name' => 'Updated',
            'last_name'  => 'Name',
            'email'      => 'new@example.com',
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.email', 'new@example.com')
                 ->assertJsonPath('message', 'Customer updated successfully.');

        $this->assertDatabaseHas('customers', ['email' => 'new@example.com']);
    }

    public function test_can_update_customer_with_same_email(): void
    {
        $customer = Customer::factory()->create(['email' => 'same@example.com']);

        $response = $this->putJson("/api/customers/{$customer->id}", [
            'first_name' => 'Same',
            'last_name'  => 'Email',
            'email'      => 'same@example.com',
        ]);

        $response->assertStatus(200);
    }

    public function test_update_returns_404_for_unknown_customer(): void
    {
        $response = $this->putJson('/api/customers/99999', [
            'first_name' => 'Ghost',
            'last_name'  => 'User',
            'email'      => 'ghost@example.com',
        ]);

        $response->assertStatus(404);
    }

    // ──────────────────────────────────────────────
    // DELETE
    // ──────────────────────────────────────────────

    public function test_can_delete_a_customer(): void
    {
        $customer = Customer::factory()->create();

        $response = $this->deleteJson("/api/customers/{$customer->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('message', 'Customer deleted successfully.');

        $this->assertDatabaseMissing('customers', ['id' => $customer->id]);
    }

    public function test_delete_returns_404_for_unknown_customer(): void
    {
        $response = $this->deleteJson('/api/customers/99999');

        $response->assertStatus(404);
    }
}
