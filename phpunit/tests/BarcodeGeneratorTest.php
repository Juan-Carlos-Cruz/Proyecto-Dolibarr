<?php

namespace Dolibarr\Tests;

use PHPUnit\Framework\TestCase;

class BarcodeGeneratorTest extends TestCase
{
    protected function setUp(): void
    {
        if (!class_exists('Barcode')) {
            $this->markTestSkipped('Barcode class not available.');
        }
    }

    public function testGenerateSupportedFormats(): void
    {
        $barcode = new \Barcode();
        $ean13 = $barcode->generate('EAN13', '123456789012');
        $qr = $barcode->generate('QR', 'dolibarr');
        $this->assertNotEmpty($ean13);
        $this->assertNotEmpty($qr);
    }

    public function testGenerateUnsupportedFormatThrows(): void
    {
        $barcode = new \Barcode();
        $this->expectException('\InvalidArgumentException');
        $barcode->generate('UNSUPPORTED', 'value');
    }
}
