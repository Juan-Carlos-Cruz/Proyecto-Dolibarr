<?php

use PHPUnit\Framework\TestCase;

final class InventoryMovementTest extends TestCase
{
    public function testMoveHandlesInOutAndTransfer(): void
    {
        $inventory = new Inventory();
        $inventory->move('PROD-1', 'MAIN', 'in', 10);
        $this->assertSame(10.0, $inventory->quantity('PROD-1', 'MAIN'));

        $inventory->move('PROD-1', 'MAIN', 'out', 4);
        $this->assertSame(6.0, $inventory->quantity('PROD-1', 'MAIN'));

        $inventory->move('PROD-1', 'MAIN', 'transfer', 5, 'SEC');
        $this->assertSame(1.0, $inventory->quantity('PROD-1', 'MAIN'));
        $this->assertSame(5.0, $inventory->quantity('PROD-1', 'SEC'));

        $movements = $inventory->movements();
        $this->assertCount(3, $movements);
        $this->assertSame('transfer', $movements[2]['type']);
    }

    public function testMoveValidatesStock(): void
    {
        $inventory = new Inventory();
        $inventory->move('PROD-2', 'MAIN', 'in', 2);

        $this->expectException(RuntimeException::class);
        $inventory->move('PROD-2', 'MAIN', 'out', 5);
    }

    public function testTransferRequiresTargetWarehouse(): void
    {
        $inventory = new Inventory();
        $inventory->move('PROD-3', 'MAIN', 'in', 5);

        $this->expectException(InvalidArgumentException::class);
        $inventory->move('PROD-3', 'MAIN', 'transfer', 1);
    }
}
