<?php
if (!defined('DOLIBARR_ROOT')) {
    $dolibarrRoot = getenv('DOLIBARR_ROOT') ?: __DIR__ . '/../htdocs';
    if (!is_dir($dolibarrRoot)) {
        throw new RuntimeException('Configure DOLIBARR_ROOT to point to Dolibarr sources.');
    }
    define('DOLIBARR_ROOT', realpath($dolibarrRoot));
}

require_once DOLIBARR_ROOT . '/master.inc.php';

if (!defined('QA_FIXTURES_LOADED')) {
    define('QA_FIXTURES_LOADED', true);
}
