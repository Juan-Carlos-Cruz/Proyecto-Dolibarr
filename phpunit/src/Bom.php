<?php

class Bom
{
    private bool $validated = false;

    /**
     * @var list<array{component: string, type: string, quantity: float, unitCost: float}>
     */
    private array $lines = [];

    public function addLine(string $component, float $quantity, float $unitCost, string $type = 'product'): void
    {
        if ($quantity <= 0) {
            throw new InvalidArgumentException('Quantity must be positive');
        }
        if ($unitCost < 0) {
            throw new InvalidArgumentException('Unit cost must be >= 0');
        }
        if (!in_array($type, ['product', 'service'], true)) {
            throw new InvalidArgumentException('Invalid component type');
        }
        if ($this->validated) {
            throw new RuntimeException('Cannot add lines once validated');
        }

        $this->lines[] = [
            'component' => $component,
            'type' => $type,
            'quantity' => $quantity,
            'unitCost' => $unitCost,
        ];
    }

    public function totalCost(): float
    {
        $total = 0.0;
        foreach ($this->lines as $line) {
            $total += $line['quantity'] * $line['unitCost'];
        }

        return round($total, 2);
    }

    public function validate(): void
    {
        if ($this->lines === []) {
            throw new RuntimeException('Cannot validate an empty BOM');
        }
        $this->validated = true;
    }

    public function isValidated(): bool
    {
        return $this->validated;
    }
}
