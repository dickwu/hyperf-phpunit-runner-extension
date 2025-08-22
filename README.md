# PHPUnit Test Runner

A VS Code extension that provides run buttons for individual PHPUnit test methods.

## Features

- **CodeLens Integration**: Shows "▶ Run Test" buttons above each test method
- **Custom PHPUnit Command**: Configurable command and arguments
- **Terminal Integration**: Runs tests in VS Code's integrated terminal
- **Smart Detection**: Automatically detects test files and methods

## Usage

1. Open a PHP test file (files ending with `Test.php` or in `/test/` or `/tests/` directories)
2. You'll see "▶ Run Test" buttons above each test method
3. Click the button to run that specific test

The extension will execute your custom PHPUnit command with the `--filter` parameter to run only the selected test method.

## Configuration

Configure the extension in VS Code settings:

- `phpunit-test-runner.phpunitPath`: Path to PHPUnit executable (default: `"php vendor/bin/co-phpunit"`)
- `phpunit-test-runner.phpunitArgs`: Additional PHPUnit arguments (default: `"--colors=always"`)

## Example Command

When you click "▶ Run Test" on a method called `testEditMessage` in `test/Cases/AdminChatTest.php`, the extension will run:

```bash
php vendor/bin/co-phpunit --colors=always test/Cases/AdminChatTest.php --filter "testEditMessage"
```

## Installation

1. Install the extension in VS Code
2. Configure your PHPUnit path and arguments in settings if different from defaults
3. Open PHP test files and start testing!

## Supported Test Method Patterns

- Methods starting with `test`: `public function testSomething()`
- Methods with `@test` annotation: Any method with `/** @test */` above it