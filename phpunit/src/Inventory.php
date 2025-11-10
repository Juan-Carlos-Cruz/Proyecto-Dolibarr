<?php

class Inventory
{
    /** @var array<string, array<string, float>> */
    private array $stocks = [];

    /**
     * @var list<array{product: string, from: string|null, to: string, qty: float, type: string}>
     */
    private array $movements = [];

    public function quantity(string $product, string $warehouse): float
    {
        return $this->stocks[$warehouse][$product] ?? 0.0;
    }

    /**
     * @return list<array{product: string, from: string|null, to: string, qty: float, type: string}>
     */
    public function movements(): array
    {
        return $this->movements;
    }

    public function move(string $product, string $warehouse, string $type, float $quantity, ?string $targetWarehouse = null): void
    {
        if ($quantity === 0.0) {
            throw new InvalidArgumentException('Quantity cannot be zero');
        }
        if (!in_array($type, ['in', 'out', 'transfer'], true)) {
            throw new InvalidArgumentException('Unsupported movement type');
        }

        if ($type === 'in') {
            $this->increase($warehouse, $product, $quantity);
            $this->movements[] = ['product' => $product, 'from' => null, 'to' => $warehouse, 'qty' => $quantity, 'type' => 'in'];
            return;
        }

        if ($type === 'out') {
            $this->decrease($warehouse, $product, $quantity);
            $this->movements[] = ['product' => $product, 'from' => $warehouse, 'to' => $warehouse, 'qty' => -$quantity, 'type' => 'out'];
            return;
        }

        if ($targetWarehouse === null) {
            throw new InvalidArgumentException('Transfer requires target warehouse');
        }

        $this->decrease($warehouse, $product, $quantity);
        $this->increase($targetWarehouse, $product, $quantity);
        $this->movements[] = ['product' => $product, 'from' => $warehouse, 'to' => $targetWarehouse, 'qty' => $quantity, 'type' => 'transfer'];
    }

    private function increase(string $warehouse, string $product, float $quantity): void
    {
        if ($quantity < 0) {
            throw new InvalidArgumentException('Increase requires positive quantity');
        }
        $this->stocks[$warehouse][$product] = ($this->stocks[$warehouse][$product] ?? 0.0) + $quantity;
    }

    private function decrease(string $warehouse, string $product, float $quantity): void
    {
        if ($quantity <= 0) {
            throw new InvalidArgumentException('Decrease requires positive quantity');
        }
        $current = $this->stocks[$warehouse][$product] ?? 0.0;
        if ($current < $quantity) {
            throw new RuntimeException('Insufficient stock');
        }
        $this->stocks[$warehouse][$product] = $current - $quantity;
    }
}
