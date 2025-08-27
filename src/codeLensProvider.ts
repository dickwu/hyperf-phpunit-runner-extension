import * as vscode from 'vscode';
import { PHPTestParser, TestMethod, TestClass } from './phpTestParser';
import { PHPUnitTestRunner } from './testRunner';

export class PHPUnitCodeLensProvider implements vscode.CodeLensProvider {
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor(private testRunner: PHPUnitTestRunner) {}

    public provideCodeLenses(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        
        if (!PHPTestParser.isTestFile(document)) {
            return [];
        }

        const testMethods = PHPTestParser.parseTestMethods(document);
        const testClass = PHPTestParser.parseTestClass(document);
        const codeLenses: vscode.CodeLens[] = [];

        // Add class-level "Run All Tests" lens if we have a test class
        if (testClass && testMethods.length > 0) {
            const runClassCommand: vscode.Command = {
                title: '▶ Run All Tests',
                command: 'phpunit-test-runner.runTestClass',
                arguments: [document.fileName, testClass.name]
            };

            const classCodeLens = new vscode.CodeLens(testClass.range, runClassCommand);
            codeLenses.push(classCodeLens);
        }

        // Add individual test method lenses
        for (const method of testMethods) {
            const runCommand: vscode.Command = {
                title: '▶ Run Test',
                command: 'phpunit-test-runner.runTestMethod',
                arguments: [document.fileName, method.name]
            };

            const codeLens = new vscode.CodeLens(method.range, runCommand);
            codeLenses.push(codeLens);
        }

        return codeLenses;
    }

    public resolveCodeLens(
        codeLens: vscode.CodeLens,
        token: vscode.CancellationToken
    ): vscode.CodeLens | Thenable<vscode.CodeLens> {
        return codeLens;
    }

    public refresh(): void {
        this._onDidChangeCodeLenses.fire();
    }
}