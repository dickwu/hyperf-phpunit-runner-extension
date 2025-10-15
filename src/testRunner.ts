import * as vscode from 'vscode';
import * as path from 'path';

export class PHPUnitTestRunner {

    public async runTestMethod(filePath: string, methodName: string): Promise<void> {
        const config = vscode.workspace.getConfiguration('hyperf-phpunit-runner');
        const phpunitPath = config.get<string>('phpunitPath') || 'php vendor/bin/co-phpunit --prepend test/bootstrap.php';
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

        // Build the command: use a regex to match all methods starting with the same prefix
        const filterPattern = `::${methodName}$`;
        const command = `${phpunitPath} ${phpunitArgs} "${relativePath}" --filter "${filterPattern}"`;

        // Show output in terminal
        this.runInTerminal(command, workspacePath, methodName);
    }

    public async runTestClass(filePath: string, className: string): Promise<void> {
        const config = vscode.workspace.getConfiguration('hyperf-phpunit-runner');
        const phpunitPath = config.get<string>('phpunitPath') || 'php vendor/bin/co-phpunit --prepend test/bootstrap.php';
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
        const command = `${phpunitPath} ${phpunitArgs} "${relativePath}"`;

        // Show output in terminal
        this.runInTerminal(command, workspacePath, `${className} (class)`);
    }

    private runInTerminal(command: string, cwd: string, testName: string): void {
        // Use the active terminal or create a new one
        let terminal = vscode.window.activeTerminal;

        if (!terminal) {
            terminal = vscode.window.createTerminal({
                name: 'PHPUnit Test Runner',
                cwd: cwd
            });
        }

        terminal.show();

        // Send the command
        terminal.sendText(`echo "Running test: ${testName}"`);
        terminal.sendText(command);

        // Show a notification
        vscode.window.showInformationMessage(`Running PHPUnit test: ${testName}`);
    }

    public dispose(): void {
        // No need to dispose terminal since we use the active terminal
    }
}