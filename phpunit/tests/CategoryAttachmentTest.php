<?php

namespace Dolibarr\Tests;

use PHPUnit\Framework\TestCase;

class CategoryAttachmentTest extends TestCase
{
    protected function setUp(): void
    {
        if (!class_exists('Categorie')) {
            $this->markTestSkipped('Categorie class not available.');
        }
    }

    public function testAttachDocumentStoresMetadata(): void
    {
        $category = new \Categorie($GLOBALS['db']);
        $category->create(['label' => 'QA Documentos', 'type' => 0]);
        $fakeFile = tempnam(sys_get_temp_dir(), 'qa');
        file_put_contents($fakeFile, 'QA');
        $result = $category->add_type_files(['tmp_name' => $fakeFile, 'name' => 'qa.pdf'], 'document', 'QA');
        $this->assertTrue($result > 0);
    }
}
