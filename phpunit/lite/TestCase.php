<?php
namespace PHPUnit\Framework;

class AssertionFailedError extends \Exception
{
}

class SkippedTestError extends \Exception
{
}

class TestCase
{
    private ?string $expectedException = null;

    protected function setUp(): void
    {
    }

    protected function tearDown(): void
    {
    }

    protected function markTestSkipped(string $message = ''): void
    {
        throw new SkippedTestError($message);
    }

    protected function fail(string $message = 'Assertion failed'): void
    {
        throw new AssertionFailedError($message);
    }

    protected function assertTrue($condition, string $message = ''): void
    {
        if (!$condition) {
            $this->fail($message ?: 'Failed asserting that condition is true.');
        }
    }

    protected function assertFalse($condition, string $message = ''): void
    {
        if ($condition) {
            $this->fail($message ?: 'Failed asserting that condition is false.');
        }
    }

    protected function assertNotEmpty($value, string $message = ''): void
    {
        if (empty($value)) {
            $this->fail($message ?: 'Failed asserting that value is not empty.');
        }
    }

    protected function assertEmpty($value, string $message = ''): void
    {
        if (!empty($value)) {
            $this->fail($message ?: 'Failed asserting that value is empty.');
        }
    }

    protected function assertGreaterThanOrEqual($expected, $actual, string $message = ''): void
    {
        if ($actual < $expected) {
            $this->fail($message ?: sprintf('Failed asserting that %s is greater than or equal to %s.', (string) $actual, (string) $expected));
        }
    }

    protected function assertLessThanOrEqual($expected, $actual, string $message = ''): void
    {
        if ($actual > $expected) {
            $this->fail($message ?: sprintf('Failed asserting that %s is less than or equal to %s.', (string) $actual, (string) $expected));
        }
    }

    protected function assertEqualsWithDelta($expected, $actual, float $delta, string $message = ''): void
    {
        if (abs($expected - $actual) > $delta) {
            $this->fail($message ?: sprintf('Failed asserting that %s matches expected %s with delta %s.', (string) $actual, (string) $expected, (string) $delta));
        }
    }

    protected function expectException(string $class): void
    {
        $this->expectedException = $class;
    }

    /**
     * @return array{status: string, message: string, time: float}
     */
    public function runTestMethod(string $method): array
    {
        $this->expectedException = null;
        try {
            $this->setUp();
        } catch (SkippedTestError $skip) {
            return ['status' => 'skipped', 'message' => $skip->getMessage(), 'time' => 0.0];
        }

        $start = microtime(true);
        $status = 'passed';
        $message = '';

        try {
            $this->$method();
            if ($this->expectedException !== null) {
                throw new AssertionFailedError('Failed asserting that exception of type ' . $this->expectedException . ' is thrown.');
            }
        } catch (SkippedTestError $skip) {
            $status = 'skipped';
            $message = $skip->getMessage();
        } catch (AssertionFailedError $failure) {
            $status = 'failed';
            $message = $failure->getMessage();
        } catch (\Throwable $throwable) {
            if ($this->expectedException !== null && is_a($throwable, $this->expectedException)) {
                $status = 'passed';
            } else {
                $status = 'error';
                $message = $throwable->getMessage();
            }
        }

        try {
            $this->tearDown();
        } catch (\Throwable $throwable) {
            if ($status === 'passed') {
                $status = 'error';
                $message = 'tearDown: ' . $throwable->getMessage();
            }
        }

        $time = microtime(true) - $start;
        return ['status' => $status, 'message' => $message, 'time' => $time];
    }
}
