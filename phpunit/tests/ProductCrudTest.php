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
        $result = $product->validateFields('create');
        $errors = property_exists($product, 'errors') ? $product->errors : [];

        $this->assertLessThanOrEqual(0, $result);
        $this->assertNotEmpty($errors);
    }

    public function testValidateFieldsAcceptsValidPayload(): void
    {
        $product = new \Product($GLOBALS['db']);
        $product->label = 'Producto QA';
        $product->ref = 'PROD-QA-VALID';
        $product->weight = 0.5;
        $result = $product->validateFields('create');
        $errors = property_exists($product, 'errors') ? $product->errors : [];

        $this->assertGreaterThanOrEqual(0, $result);
        $this->assertEmpty($errors);
    }
}
