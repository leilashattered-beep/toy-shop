<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'phone' => ['required', 'string', 'min:5', 'max:32'],
            'address' => ['required', 'string', 'min:8', 'max:255'],
            'comment' => ['nullable', 'string', 'max:500'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'имя',
            'phone' => 'телефон',
            'address' => 'адрес доставки',
            'comment' => 'комментарий',
            'items' => 'состав заказа',
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Корзина пуста — добавьте хотя бы одну игрушку.',
        ];
    }
}
