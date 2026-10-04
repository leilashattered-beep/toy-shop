<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'text' => ['required', 'string', 'min:5', 'max:2000'],
        ];
    }

    public function attributes(): array
    {
        return [
            'rating' => 'оценка',
            'text' => 'текст отзыва',
        ];
    }
}
