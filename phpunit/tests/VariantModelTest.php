<?php

namespace Dolibarr\Tests;

use PHPUnit\Framework\TestCase;

class VariantModelTest extends TestCase
{
    protected function setUp(): void
    {
        if (!class_exists('Variants')) {
            $this->markTestSkipped('Variants class not available.');
        }
    }

    public function testCreateVariantPreventsDuplicateCombination(): void
    {
        $variants = new \Variants($GLOBALS['db']);
        $productId = 1;
        $combination = ['Talla' => 'M', 'Color' => 'Azul'];
        $variants->createVariant($productId, $combination);
        $result = $variants->createVariant($productId, $combination);
        $this->assertLessThanOrEqual(0, $result);
    }
}
