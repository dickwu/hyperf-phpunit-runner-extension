import * as vscode from 'vscode';
import * as path from 'path';

export class PHPUnitTestRunner {
    private terminal: vscode.Terminal | undefined;

    public async runTestMethod(filePath: string, methodName: string): Promise<void> {
        const config = vscode.workspace.getConfiguration('phpunit-test-runner');
        const phpunitPath = config.get<string>('phpunitPath') || 'php vendor/bin/co-phpunit';
        const phpunitArgs = config.get<string>('phpunitArgs') || '--colors=always';

        // Get workspace folder
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
        const workspacePath = workspaceFolder?.uri.fsPath;
        
        if (!workspacePath) {
            vscode.window.showErrorMessage('Could not determine workspace folder');
            return;
        }

        // Convert absolute path to relative path from workspace root
        const relativePath = path.relative(workspacePath, filePath);
        
        // Build the command
        const command = `${phpunitPath} ${phpunitArgs} "${relativePath}" --filter "${methodName}"`;
        
        // Show output in terminal
        this.runInTerminal(command, workspacePath, methodName);
    }

    private runInTerminal(command: string, cwd: string, testName: string): void {
        // Create or reuse terminal
        if (!this.terminal || this.terminal.exitStatus !== undefined) {
            this.terminal = vscode.window.createTerminal({
                name: 'PHPUnit Test Runner',
                cwd: cwd
            });
        }

        this.terminal.show();
        
        // Send the command
        this.terminal.sendText(`echo "Running test: ${testName}"`);
        this.terminal.sendText(command);
        
        // Show a notification
        vscode.window.showInformationMessage(`Running PHPUnit test: ${testName}`);
    }

    public dispose(): void {
        if (this.terminal) {
            this.terminal.dispose();
        }
    }
}