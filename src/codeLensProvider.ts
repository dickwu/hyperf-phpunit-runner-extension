import * as vscode from 'vscode';
import { PHPTestParser, TestMethod } from './phpTestParser';
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
        const codeLenses: vscode.CodeLens[] = [];

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