<?php

class CategoryAttachment
{
    /**
     * @param non-empty-string $filePath
     * @param array{category?: string|null} $options
     * @return array{path: string, category: string|null, size: int}
     */
    public function attachDocument(string $filePath, array $options = []): array
    {
        if (!is_file($filePath)) {
            throw new InvalidArgumentException('File does not exist');
        }

        $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        if (!in_array($ext, ['pdf', 'jpg', 'jpeg', 'png'], true)) {
            throw new InvalidArgumentException('Unsupported document type');
        }

        $size = filesize($filePath);
        if ($size === false || $size === 0) {
            throw new RuntimeException('File appears to be empty');
        }

        return [
            'path' => realpath($filePath) ?: $filePath,
            'category' => $options['category'] ?? null,
            'size' => $size,
        ];
    }
}
