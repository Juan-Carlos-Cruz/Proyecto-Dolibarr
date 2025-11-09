<?php
class Barcode
{
    /**
     * @return string
     */
    public function generate(string $type, string $value)
    {
        $supported = ['EAN13', 'QR'];
        if (!in_array($type, $supported, true)) {
            throw new InvalidArgumentException('Unsupported barcode type: ' . $type);
        }
        return base64_encode($type . ':' . $value);
    }
}
