<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name'     => ['required', 'string', 'max:45'],
            'last_name'      => ['required', 'string', 'max:45'],
            'email'          => ['required', 'email', 'max:100', 'unique:customers,email'],
            'contact_number' => ['nullable', 'digits_between:1,15'],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'First name is required.',
            'last_name.required'  => 'Last name is required.',
            'email.required'      => 'Email address is required.',
            'email.email'         => 'Please provide a valid email address.',
            'email.unique'        => 'This email address is already taken.',
            'contact_number.digits_between' => 'Contact number must contain 1 to 15 digits.',
        ];
    }
}
