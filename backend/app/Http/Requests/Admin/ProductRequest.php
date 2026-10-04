<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        $productId = $this->route('product')?->id;

        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'min:2', 'max:150'],
            'slug' => [
                'nullable',
                'string',
                'max:160',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('products', 'slug')->ignore($productId),
            ],
            'description' => ['required', 'string', 'min:10'],
            'price' => ['required', 'numeric', 'min:0', 'max:1000000'],
            'old_price' => ['nullable', 'numeric', 'min:0', 'max:1000000'],
            'image' => ['nullable', 'string', 'max:255'],
            'size' => ['nullable', 'string', 'max:64'],
            'material' => ['nullable', 'string', 'max:150'],
            'stock' => ['required', 'integer', 'min:0', 'max:100000'],
            'is_featured' => ['boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'category_id' => 'категория',
            'name' => 'название',
            'slug' => 'ссылка (slug)',
            'description' => 'описание',
            'price' => 'цена',
            'old_price' => 'старая цена',
            'image' => 'изображение',
            'size' => 'размер',
            'material' => 'материал',
            'stock' => 'остаток на складе',
        ];
    }

    public function messages(): array
    {
        return [
            'slug.regex' => 'Slug может содержать только латинские буквы, цифры и дефис.',
        ];
    }
}
