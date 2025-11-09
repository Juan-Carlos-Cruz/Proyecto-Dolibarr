<?php

namespace Dolibarr\Tests;

use PHPUnit\Framework\TestCase;

/**
 * @coversNothing
 */
class ProductCrudTest extends TestCase
{
    protected function setUp(): void
    {
        if (!class_exists('Product')) {
            $this->markTestSkipped('Product class not available.');
        }
    }

    public function testValidateFieldsRejectsEmptyLabel(): void
    {
        $product = new \Product($GLOBALS['db']);
        $product->label = '';
        $this->expectException('\Exception');
        $product->validateFields('create');
    }

    public function testValidateFieldsAcceptsValidPayload(): void
    {
        $product = new \Product($GLOBALS['db']);
        $product->label = 'Producto QA';
        $product->ref = 'PROD-QA-VALID';
        $product->weight = 0.5;
        $this->assertTrue($product->validateFields('create'));
    }
}
