<?php

use PHPUnit\Framework\TestCase;

final class BarcodeGeneratorTest extends TestCase
{
    public function testGenerateEan13ComputesCheckDigit(): void
    {
        $generator = new BarcodeGenerator();
        $barcode = $generator->generate('ean13', '400638133393');

        $this->assertSame('4006381333931', $barcode);
    }

    public function testGenerateEan13RejectsInvalidCheckDigit(): void
    {
        $generator = new BarcodeGenerator();

        $this->expectException(InvalidArgumentException::class);
        $generator->generate('ean13', '4006381333930');
    }

    public function testGenerateQrReturnsBase64(): void
    {
        $generator = new BarcodeGenerator();
        $barcode = $generator->generate('qr', 'QA-123');

        $this->assertSame(base64_encode('QA-123'), $barcode);
    }
}
