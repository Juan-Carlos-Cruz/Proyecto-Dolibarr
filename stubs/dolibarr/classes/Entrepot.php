<?php
class Entrepot
{
    public DolibarrStubDatabase $db;
    /** @var array<int, float> */
    private array $stock = [];

    public function __construct(DolibarrStubDatabase $db)
    {
        $this->db = $db;
    }

    public function stock_mouvement($user, int $productId, int $warehouseId, float $qty, int $movementType, int $movementId, string $label, int $price, int $value, int $inventorycode, int $origin): int
    {
        if ($qty < 0) {
            $this->db->log('Rejected stock movement for product ' . $productId);
            return -1;
        }
        $this->stock[$productId] = ($this->stock[$productId] ?? 0.0) + $qty;
        $this->db->log('Registered stock movement for product ' . $productId . ' qty ' . $qty);
        return (int) $this->stock[$productId];
    }
}
