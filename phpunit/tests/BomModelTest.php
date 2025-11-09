<?php

namespace Dolibarr\Tests;

use PHPUnit\Framework\TestCase;

class BomModelTest extends TestCase
{
    protected function setUp(): void
    {
        if (!class_exists('BOM')) {
            $this->markTestSkipped('BOM class not available.');
        }
    }

    public function testAddLineRejectsZeroQuantity(): void
    {
        $bom = new \BOM($GLOBALS['db']);
        $bom->create(['label' => 'QA BOM', 'fk_product_parent' => 1]);
        $result = $bom->addline(['qty' => 0]);
        $this->assertLessThanOrEqual(0, $result);
    }
}
