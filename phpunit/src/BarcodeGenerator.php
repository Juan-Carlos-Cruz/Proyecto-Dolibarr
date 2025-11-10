<?php

class BarcodeGenerator
{
    public function generate(string $format, string $value): string
    {
        return match (strtolower($format)) {
            'ean13' => $this->generateEan13($value),
            'qr' => $this->generateQr($value),
            default => throw new InvalidArgumentException('Unsupported barcode format'),
        };
    }

    private function generateEan13(string $value): string
    {
        if (!preg_match('/^\d{12,13}$/', $value)) {
            throw new InvalidArgumentException('EAN13 requires 12 or 13 digits');
        }

        $digits = substr($value, 0, 12);
        $check = $this->computeEan13CheckDigit($digits);
        $full = $digits . $check;
        if (strlen($value) === 13 && $value !== $full) {
            throw new InvalidArgumentException('Invalid EAN13 check digit');
        }

        return $full;
    }

    private function generateQr(string $value): string
    {
        if ($value === '') {
            throw new InvalidArgumentException('QR value cannot be empty');
        }

        return base64_encode($value);
    }

    private function computeEan13CheckDigit(string $digits): string
    {
        $sum = 0;
        for ($i = 0; $i < 12; $i++) {
            $num = (int) $digits[$i];
            $sum += $i % 2 === 0 ? $num : $num * 3;
        }
        $mod = $sum % 10;
        $check = ($mod === 0) ? 0 : 10 - $mod;
        return (string) $check;
    }
}
