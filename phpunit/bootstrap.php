<?php
if (!defined('DOLIBARR_ROOT')) {
    $dolibarrRoot = getenv('DOLIBARR_ROOT') ?: __DIR__ . '/../htdocs';
    if (is_dir($dolibarrRoot) && is_file($dolibarrRoot . '/master.inc.php')) {
        define('DOLIBARR_ROOT', realpath($dolibarrRoot));
        require_once DOLIBARR_ROOT . '/master.inc.php';
    } else {
        define('DOLIBARR_ROOT', __DIR__ . '/../stubs/dolibarr');
        require_once __DIR__ . '/../stubs/dolibarr/bootstrap.php';
    }
} else {
    require_once DOLIBARR_ROOT . '/master.inc.php';
}

if (!defined('QA_FIXTURES_LOADED')) {
    define('QA_FIXTURES_LOADED', true);
}
