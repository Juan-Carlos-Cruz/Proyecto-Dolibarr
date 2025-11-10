<?php

class ProductValidator
{
    public const MAX_VAT = 25.0;

    /**
     * @param array{label?: string, weight?: float|int|string, vat?: float|int|string, hts?: string|null} $input
     * @return array{label: string, weight: float, vat: float, hts?: string}
     */
    public function validate(array $input): array
    {
        $label = trim((string)($input['label'] ?? ''));
        if ($label === '') {
            throw new InvalidArgumentException('Label is required');
        }

        $weight = (float)($input['weight'] ?? 0.0);
        if ($weight < 0) {
            throw new InvalidArgumentException('Weight must be >= 0');
        }
        if ($weight > 9999) {
            throw new InvalidArgumentException('Weight exceeds allowed limit');
        }

        $vat = (float)($input['vat'] ?? 0.0);
        if ($vat < 0 || $vat > self::MAX_VAT) {
            throw new InvalidArgumentException('VAT out of range');
        }

        $hts = $input['hts'] ?? null;
        if ($hts !== null && $hts !== '') {
            if (!preg_match('/^\d{4}(\.\d{2}){0,2}$/', $hts)) {
                throw new InvalidArgumentException('HTS code format invalid');
            }
        }

        return [
            'label' => $label,
            'weight' => round($weight, 3),
            'vat' => round($vat, 2),
            'hts' => $hts ?: null,
        ];
    }
}
