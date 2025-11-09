<?php
class BOM
{
    public DolibarrStubDatabase $db;
    public int $id;
    public string $label = '';
    public int $fk_product_parent = 0;
    /** @var array<int, array<string, mixed>> */
    public array $lines = [];

    public function __construct(DolibarrStubDatabase $db)
    {
        $this->db = $db;
        $this->id = random_int(1, 1000);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function create(array $data): int
    {
        $this->label = (string) ($data['label'] ?? '');
        $this->fk_product_parent = (int) ($data['fk_product_parent'] ?? 0);
        $this->db->log('Created BOM ' . $this->label);
        return $this->id;
    }

    /**
     * @param array<string, mixed> $line
     */
    public function addline(array $line): int
    {
        $qty = isset($line['qty']) ? (float) $line['qty'] : 0.0;
        if ($qty <= 0) {
            $this->db->log('Rejected BOM line with quantity ' . $qty);
            return -1;
        }
        $this->lines[] = $line;
        return count($this->lines);
    }
}
