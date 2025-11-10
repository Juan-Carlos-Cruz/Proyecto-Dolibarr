<?php

use PHPUnit\Framework\TestCase;

final class ProductValidatorTest extends TestCase
{
    private ProductValidator $validator;

    protected function setUp(): void
    {
        $this->validator = new ProductValidator();
    }

    public function testValidateAcceptsValidPayload(): void
    {
        $result = $this->validator->validate([
            'label' => 'Producto QA',
            'weight' => 0.25,
            'vat' => 19,
            'hts' => '1234.56.78',
        ]);

        $this->assertSame('Producto QA', $result['label']);
        $this->assertSame(0.25, $result['weight']);
        $this->assertSame(19.0, $result['vat']);
        $this->assertSame('1234.56.78', $result['hts']);
    }

    /**
     * @dataProvider invalidPayloadProvider
     */
    public function testValidateRejectsInvalidPayload(array $payload, string $expectedMessage): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage($expectedMessage);
        $this->validator->validate($payload);
    }

    public static function invalidPayloadProvider(): iterable
    {
        yield 'missing label' => [['weight' => 1, 'vat' => 5], 'Label is required'];
        yield 'negative weight' => [['label' => 'QA', 'weight' => -1, 'vat' => 5], 'Weight must be >= 0'];
        yield 'excessive weight' => [['label' => 'QA', 'weight' => 10000, 'vat' => 5], 'Weight exceeds allowed limit'];
        yield 'vat out of range' => [['label' => 'QA', 'weight' => 1, 'vat' => 50], 'VAT out of range'];
        yield 'invalid hts' => [['label' => 'QA', 'weight' => 1, 'vat' => 5, 'hts' => '12A'], 'HTS code format invalid'];
    }
}
