#!/usr/bin/env php
<?php
require_once __DIR__ . '/lite/TestCase.php';
require_once __DIR__ . '/lite/Runner.php';

$bootstrap = __DIR__ . '/bootstrap.php';
if (is_file($bootstrap)) {
    require_once $bootstrap;
}

$testFiles = glob(__DIR__ . '/tests/*.php');
$runner = new Dolibarr\PhpUnitLite\Runner();
$success = $runner->run($testFiles ?: []);
exit($success ? 0 : 1);
