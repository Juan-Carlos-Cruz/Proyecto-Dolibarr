<?php
class Product
{
    public DolibarrStubDatabase $db;
    public string $label = '';
    public string $ref = '';
    public float $weight = 0.0;
    public string $size = '';
    public string $hts = '';
    public float $tva_tx = 0.0;
    public float $price = 0.0;
    public float $price_min = 0.0;
    /** @var array<int, string> */
    public array $errors = [];

    public function __construct(DolibarrStubDatabase $db)
    {
        $this->db = $db;
    }

    public function validateFields(string $context): int
    {
        $this->errors = [];
        if (trim($this->label) === '') {
            $this->errors[] = 'Label is required';
        }
        if (trim($this->ref) === '') {
            $this->errors[] = 'Reference is required';
        }
        if ($context === 'create' && $this->weight < 0) {
            $this->errors[] = 'Weight must be positive';
        }
        return empty($this->errors) ? 1 : -1;
    }

    public function price2num(float $price): float
    {
        return round($price, 6);
    }

    public function getVat(float $basePrice): float
    {
        return round($basePrice * ($this->tva_tx / 100), 6);
    }

    public function checkPrice(string $context): bool
    {
        if ($context === 'sell' && $this->price_min > 0) {
            return $this->price >= $this->price_min;
        }
        return true;
    }
}
