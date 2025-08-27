import * as vscode from 'vscode';

export interface TestMethod {
    name: string;
    range: vscode.Range;
    line: number;
}

export interface TestClass {
    name: string;
    range: vscode.Range;
    line: number;
}

export class PHPTestParser {
    static parseTestMethods(document: vscode.TextDocument): TestMethod[] {
        const testMethods: TestMethod[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Match test methods: public function test... or /** @test */ public function ...
            const testMethodMatch = line.match(/^\s*(?:public\s+)?function\s+(test\w+)\s*\(/);
            
            // Also match methods with @test annotation
            let isTestMethod = false;
            let methodName = '';
            
            if (testMethodMatch) {
                methodName = testMethodMatch[1];
                isTestMethod = true;
            } else {
                // Check for @test annotation in previous lines
                for (let j = Math.max(0, i - 10); j < i; j++) {
                    if (lines[j].includes('@test')) {
                        const functionMatch = line.match(/^\s*(?:public\s+)?function\s+(\w+)\s*\(/);
                        if (functionMatch) {
                            methodName = functionMatch[1];
                            isTestMethod = true;
                            break;
                        }
                    }
                }
            }
            
            if (isTestMethod && methodName) {
                const range = new vscode.Range(
                    new vscode.Position(i, 0),
                    new vscode.Position(i, line.length)
                );
                
                testMethods.push({
                    name: methodName,
                    range,
                    line: i
                });
            }
        }
        
        return testMethods;
    }
    
    static parseTestClass(document: vscode.TextDocument): TestClass | null {
        const text = document.getText();
        const lines = text.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Match class declaration that extends TestCase or has Test in the name
            const classMatch = line.match(/^\s*(?:abstract\s+)?class\s+(\w*Test\w*)\s*(?:extends\s+\w+)?/);
            
            if (classMatch) {
                const className = classMatch[1];
                const range = new vscode.Range(
                    new vscode.Position(i, 0),
                    new vscode.Position(i, line.length)
                );
                
                return {
                    name: className,
                    range,
                    line: i
                };
            }
        }
        
        return null;
    }
    
    static isTestFile(document: vscode.TextDocument): boolean {
        const fileName = document.fileName;
        
        // Check if file ends with Test.php or is in a test directory
        return fileName.includes('Test.php') || 
               fileName.includes('/test/') || 
               fileName.includes('/tests/') ||
               fileName.includes('\\test\\') || 
               fileName.includes('\\tests\\');
    }
}