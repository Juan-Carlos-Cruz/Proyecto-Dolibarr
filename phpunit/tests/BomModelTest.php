<?php

use PHPUnit\Framework\TestCase;

final class BomModelTest extends TestCase
{
    public function testAddLineAccumulatesCostAndValidates(): void
    {
        $bom = new Bom();
        $bom->addLine('COMP-01', 2, 10.0, 'product');
        $bom->addLine('SERV-01', 1, 5.5, 'service');

        $this->assertSame(25.5, $bom->totalCost());
        $bom->validate();
        $this->assertTrue($bom->isValidated());
    }

    public function testCannotAddLineWithInvalidQuantity(): void
    {
        $bom = new Bom();

        $this->expectException(InvalidArgumentException::class);
        $bom->addLine('COMP-02', 0, 1.0);
    }

    public function testCannotValidateEmptyBom(): void
    {
        $bom = new Bom();

        $this->expectException(RuntimeException::class);
        $bom->validate();
    }
}
