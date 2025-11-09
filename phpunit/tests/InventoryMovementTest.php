<?php

namespace Dolibarr\Tests;

use PHPUnit\Framework\TestCase;

class InventoryMovementTest extends TestCase
{
    protected function setUp(): void
    {
        if (!class_exists('Entrepot')) {
            $this->markTestSkipped('Entrepot class not available.');
        }
    }

    public function testMoveStockRejectsNegativeQuantity(): void
    {
        $warehouse = new \Entrepot($GLOBALS['db']);
        $productId = 1;
        $result = $warehouse->stock_mouvement($GLOBALS['user'], $productId, 0, -1, 0, 0, 'QA', 0, 0, 0, 0);
        $this->assertLessThanOrEqual(0, $result);
    }
}
