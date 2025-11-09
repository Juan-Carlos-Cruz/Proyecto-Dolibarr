<?php

namespace Dolibarr\Tests;

use PHPUnit\Framework\TestCase;

/**
 * @coversNothing
 */
class ProductPriceTest extends TestCase
{
    protected function setUp(): void
    {
        if (!class_exists('Product')) {
            $this->markTestSkipped('Product class not available.');
        }
    }

    public function testVatComputation(): void
    {
        $product = new \Product($GLOBALS['db']);
        $scenarios = [
            [0.0, 100.0, 0.0],
            [0.05, 100.0, 5.0],
            [0.19, 100.0, 19.0],
            [0.25, 80.0, 20.0],
        ];

        foreach ($scenarios as [$vatRate, $basePrice, $expectedIncrement]) {
            $product->tva_tx = $vatRate * 100;
            $price = $product->price2num($basePrice);
            $vat = $product->getVat($price);
            $this->assertEqualsWithDelta($expectedIncrement, $vat, 0.01);
        }
    }

    public function testMinimumPriceValidation(): void
    {
        $product = new \Product($GLOBALS['db']);
        $product->price = 80.0;
        $product->price_min = 90.0;
        $this->assertFalse($product->checkPrice('sell')); // triggers business rule
    }
}
