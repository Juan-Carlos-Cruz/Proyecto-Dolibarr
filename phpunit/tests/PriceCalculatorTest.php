<?php

use PHPUnit\Framework\TestCase;

final class PriceCalculatorTest extends TestCase
{
    public function testComputeSalePriceWithVatIncludedRespectsMinimum(): void
    {
        $calc = new PriceCalculator(vatRate: 0.19, minPrice: 100.0);
        $price = $calc->computeSalePrice(base: 80.0, discount: 0.1, vatIncluded: true);

        $this->assertSame(100.0, $price);
    }

    public function testComputeSalePriceAddsVatWhenNotIncluded(): void
    {
        $calc = new PriceCalculator(vatRate: 0.19, minPrice: 0.0);
        $price = $calc->computeSalePrice(base: 100.0, discount: 0.0, vatIncluded: false);

        $this->assertSame(119.0, $price);
    }

    public function testComputeSalePriceRejectsInvalidDiscount(): void
    {
        $calc = new PriceCalculator(vatRate: 0.19, minPrice: 0.0);

        $this->expectException(InvalidArgumentException::class);
        $calc->computeSalePrice(base: 100.0, discount: 1.5, vatIncluded: true);
    }
}
