<?php
if (!class_exists('DolibarrStubDatabase')) {
    class DolibarrStubDatabase
    {
        /** @var array<int, string> */
        public array $logs = [];

        public function log(string $message): void
        {
            $this->logs[] = $message;
        }
    }
}

if (!class_exists('DolibarrStubUser')) {
    class DolibarrStubUser
    {
        public int $id;
        public string $login;
        public string $lastname;
        public string $firstname;

        public function __construct(int $id, string $login)
        {
            $this->id = $id;
            $this->login = $login;
            $this->lastname = 'QA';
            $this->firstname = 'Automation';
        }
    }
}

$GLOBALS['db'] = new DolibarrStubDatabase();
$GLOBALS['user'] = new DolibarrStubUser(1, 'admin');

require_once __DIR__ . '/classes/Product.php';
require_once __DIR__ . '/classes/Bom.php';
require_once __DIR__ . '/classes/Entrepot.php';
require_once __DIR__ . '/classes/Variants.php';
require_once __DIR__ . '/classes/Categorie.php';
require_once __DIR__ . '/classes/Barcode.php';
