<?php
class Variants
{
    public DolibarrStubDatabase $db;
    /** @var array<int, array<string, array<string, string>>> */
    private array $combinations = [];

    public function __construct(DolibarrStubDatabase $db)
    {
        $this->db = $db;
    }

    /**
     * @param array<string, string> $combination
     */
    public function createVariant(int $productId, array $combination): int
    {
        $key = json_encode($combination);
        if (isset($this->combinations[$productId][$key])) {
            $this->db->log('Rejected duplicate variant for product ' . $productId);
            return -1;
        }
        $this->combinations[$productId][$key] = $combination;
        $this->db->log('Created variant for product ' . $productId);
        return count($this->combinations[$productId]);
    }
}
