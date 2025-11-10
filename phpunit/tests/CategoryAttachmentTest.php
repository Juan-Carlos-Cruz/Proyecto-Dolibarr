<?php

use PHPUnit\Framework\TestCase;

final class CategoryAttachmentTest extends TestCase
{
    private string $file;

    protected function setUp(): void
    {
        $this->file = tempnam(sys_get_temp_dir(), 'qa');
        file_put_contents($this->file, 'PDF');
        rename($this->file, $this->file .= '.pdf');
    }

    protected function tearDown(): void
    {
        if (is_file($this->file)) {
            unlink($this->file);
        }
    }

    public function testAttachDocumentReturnsMetadata(): void
    {
        $attachment = new CategoryAttachment();
        $result = $attachment->attachDocument($this->file, ['category' => 'Manuals']);

        $this->assertStringContainsString('.pdf', $result['path']);
        $this->assertSame('Manuals', $result['category']);
        $this->assertGreaterThan(0, $result['size']);
    }

    public function testAttachDocumentRejectsUnsupportedExtension(): void
    {
        $invalid = tempnam(sys_get_temp_dir(), 'qa');
        file_put_contents($invalid, 'GIF');
        $invalid .= '.gif';
        rename(substr($invalid, 0, -4), $invalid);

        $attachment = new CategoryAttachment();

        try {
            $attachment->attachDocument($invalid);
            $this->fail('Unsupported format should throw');
        } catch (InvalidArgumentException $e) {
            $this->assertStringContainsString('Unsupported', $e->getMessage());
        } finally {
            if (is_file($invalid)) {
                unlink($invalid);
            }
        }
    }
}
