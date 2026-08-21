<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('email') && is_string($this->email)) {
            $this->merge([
                'email' => strtolower(trim($this->email)),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'first_name'     => ['required', 'string', 'max:45'],
            'last_name'      => ['required', 'string', 'max:45'],
            'email'          => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/',
                Rule::unique('customers', 'email')->ignore($this->route('customer')),
            ],
            'contact_number' => ['nullable', 'digits_between:1,15'],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'First name is required.',
            'last_name.required'  => 'Last name is required.',
            'email.required'      => 'Email address is required.',
            'email.regex'         => 'Please provide a valid email address with @ and a domain (e.g. name@example.com).',
            'email.unique'        => 'This email address is already taken.',
            'contact_number.digits_between' => 'Contact number must contain only numbers (1 to 15 digits).',
        ];
    }
}

