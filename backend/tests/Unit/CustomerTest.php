<?php

namespace Tests\Unit;

use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that a customer can be created with valid attributes.
     */
    public function test_customer_can_be_created(): void
    {
        $customer = Customer::create([
            'first_name'     => 'John',
            'last_name'      => 'Doe',
            'email'          => 'john.doe@example.com',
            'contact_number' => '63912345678',
        ]);

        $this->assertDatabaseHas('customers', [
            'email' => 'john.doe@example.com',
        ]);

        $this->assertEquals('John', $customer->first_name);
        $this->assertEquals('Doe', $customer->last_name);
    }

    /**
     * Test the full_name computed via resource (first + last).
     */
    public function test_customer_full_name_is_concatenation_of_first_and_last(): void
    {
        $customer = Customer::factory()->create([
            'first_name' => 'Jane',
            'last_name'  => 'Smith',
        ]);

        $this->assertEquals('Jane Smith', "{$customer->first_name} {$customer->last_name}");
    }

    /**
     * Test that contact_number is nullable.
     */
    public function test_customer_contact_number_can_be_null(): void
    {
        $customer = Customer::create([
            'first_name'     => 'Alice',
            'last_name'      => 'Wonderland',
            'email'          => 'alice@example.com',
            'contact_number' => null,
        ]);

        $this->assertNull($customer->contact_number);
    }

    /**
     * Test that email is automatically normalized to lowercase.
     */
    public function test_customer_email_is_normalized_to_lowercase(): void
    {
        $customer = Customer::create([
            'first_name'     => 'Alice',
            'last_name'      => 'Wonderland',
            'email'          => 'ALICE.UPPER@EXAMPLE.COM',
            'contact_number' => null,
        ]);

        $this->assertEquals('alice.upper@example.com', $customer->email);
    }
}

