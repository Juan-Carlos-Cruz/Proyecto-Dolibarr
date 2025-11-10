<?php

use PHPUnit\Framework\TestCase;

final class VariantModelTest extends TestCase
{
    public function testCreateVariantStoresUniqueCombination(): void
    {
        $model = new VariantModel();
        $variant = $model->createVariant(['Talla' => 'S', 'Color' => 'Rojo']);

        $this->assertSame('VAR-001', $variant['id']);
        $this->assertSame(['Color' => 'Rojo', 'Talla' => 'S'], $variant['attributes']);
        $this->assertCount(1, $model->all());
    }

    public function testCreateVariantRejectsDuplicates(): void
    {
        $model = new VariantModel();
        $model->createVariant(['Talla' => 'S', 'Color' => 'Rojo']);

        $this->expectException(RuntimeException::class);
        $model->createVariant(['Color' => 'Rojo', 'Talla' => 'S']);
    }

    public function testCreateVariantRequiresAttributeValues(): void
    {
        $model = new VariantModel();

        $this->expectException(InvalidArgumentException::class);
        $model->createVariant(['Talla' => '']);
    }
}
