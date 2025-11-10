<?php

class VariantModel
{
    /** @var array<string, array<string, string>> */
    private array $variants = [];

    public function createVariant(array $attributes): array
    {
        if ($attributes === [] || count($attributes) < 1) {
            throw new InvalidArgumentException('At least one attribute is required');
        }

        ksort($attributes);
        foreach ($attributes as $attribute => $value) {
            if ($value === '') {
                throw new InvalidArgumentException('Attribute values cannot be empty');
            }
        }

        $key = json_encode($attributes, JSON_THROW_ON_ERROR);
        if (isset($this->variants[$key])) {
            throw new RuntimeException('Variant already exists');
        }

        $identifier = sprintf('VAR-%03d', count($this->variants) + 1);
        $this->variants[$key] = $attributes;

        return [
            'id' => $identifier,
            'attributes' => $attributes,
        ];
    }

    /**
     * @return list<array<string, string>>
     */
    public function all(): array
    {
        return array_values($this->variants);
    }
}
