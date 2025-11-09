<?php
namespace Dolibarr\PhpUnitLite;

use PHPUnit\Framework\TestCase;

class Runner
{
    /**
     * @param array<int, string> $files
     */
    public function run(array $files): bool
    {
        foreach ($files as $file) {
            require_once $file;
        }

        $classes = array_filter(
            get_declared_classes(),
            static fn (string $class): bool => is_subclass_of($class, TestCase::class)
        );

        $allPassed = true;
        foreach ($classes as $class) {
            $case = new $class();
            $methods = array_filter(get_class_methods($case), static fn (string $method): bool => str_starts_with($method, 'test'));
            foreach ($methods as $method) {
                $result = $case->runTestMethod($method);
                $this->outputResult($class, $method, $result['status'], $result['message'], $result['time']);
                if ($result['status'] !== 'passed' && $result['status'] !== 'skipped') {
                    $allPassed = false;
                }
            }
        }

        return $allPassed;
    }

    private function outputResult(string $class, string $method, string $status, string $message, float $time): void
    {
        $prefix = match ($status) {
            'passed' => '[PASS]',
            'skipped' => '[SKIP]',
            'failed' => '[FAIL]',
            default => '[ERR]'
        };
        $line = sprintf('%s %s::%s (%.3fs)', $prefix, $class, $method, $time);
        if ($message !== '') {
            $line .= ' - ' . $message;
        }
        fwrite(STDOUT, $line . PHP_EOL);
    }
}
