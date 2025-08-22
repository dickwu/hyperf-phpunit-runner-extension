import * as vscode from 'vscode';
import { PHPUnitCodeLensProvider } from './codeLensProvider';
import { PHPUnitTestRunner } from './testRunner';

export function activate(context: vscode.ExtensionContext) {
    const testRunner = new PHPUnitTestRunner();
    const codeLensProvider = new PHPUnitCodeLensProvider(testRunner);

    const codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
        { language: 'php' },
        codeLensProvider
    );

    const runTestCommand = vscode.commands.registerCommand(
        'phpunit-test-runner.runTestMethod',
        (filePath: string, methodName: string) => {
            testRunner.runTestMethod(filePath, methodName);
        }
    );

    context.subscriptions.push(codeLensProviderDisposable, runTestCommand);
}

export function deactivate() {}