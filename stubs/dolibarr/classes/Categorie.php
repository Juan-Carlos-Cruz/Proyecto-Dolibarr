<?php
class Categorie
{
    public DolibarrStubDatabase $db;
    public int $id;
    public string $label = '';
    public int $type = 0;
    /** @var array<int, array{path: string, label: string, type: string}> */
    public array $documents = [];

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
        $this->type = (int) ($data['type'] ?? 0);
        $this->db->log('Created category ' . $this->label);
        return $this->id;
    }

    /**
     * @param array{tmp_name: string, name: string} $file
     */
    public function add_type_files(array $file, string $type, string $label)
    {
        if (!is_file($file['tmp_name'])) {
            return -1;
        }
        $this->documents[] = [
            'path' => $file['tmp_name'],
            'label' => $label,
            'type' => $type,
        ];
        $this->db->log('Attached file ' . $file['name'] . ' to category ' . $this->label);
        return count($this->documents);
    }
}
