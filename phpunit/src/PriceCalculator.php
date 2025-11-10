<?php

class PriceCalculator
{
    public function __construct(
        private readonly float $vatRate,
        private readonly float $minPrice = 0.0
    ) {
        if ($vatRate < 0) {
            throw new InvalidArgumentException('VAT rate must be positive');
        }
        if ($minPrice < 0) {
            throw new InvalidArgumentException('Minimum price must be >= 0');
        }
    }

    public function computeSalePrice(float $base, float $discount, bool $vatIncluded): float
    {
        if ($base < 0) {
            throw new InvalidArgumentException('Base price must be >= 0');
        }
        if ($discount < 0 || $discount > 1) {
            throw new InvalidArgumentException('Discount must be between 0 and 1');
        }

        $price = $base * (1 - $discount);
        if (!$vatIncluded) {
            $price *= (1 + $this->vatRate);
        }

        if ($price < $this->minPrice) {
            $price = $this->minPrice;
        }

        return round($price, 2);
    }
}
