<?php
spl_autoload_register(function (string $class): void {
    $path = __DIR__ . '/src/' . str_replace('\\', '/', $class) . '.php';
    if (is_file($path)) {
        require_once $path;
    }
});
