import * as vscode from 'vscode';
const figlet = require('figlet');

const standardFont = require('figlet/importable-fonts/Standard.js');

export function activate(context: vscode.ExtensionContext) {

  figlet.parseFont('Standard', standardFont.default || standardFont);

  let disposable = vscode.commands.registerCommand('ascii-art-generator.generateAsciiArt', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage("Can't find your editor!");
      return;
    }

    const selection = editor.selection;
    const text = editor.document.getText(selection);

    if (!text) {
      vscode.window.showInformationMessage("You didn't even select text, you get nothing :)");
      return;
    }

    figlet(text, { font: 'Standard' }, (err: any, data: any) => {
      if (err) {
        vscode.window.showErrorMessage('Error generating ASCII art :( ' + err.message);
        return;
      }


      if (data) {
        editor.edit((editBuilder: vscode.TextEditorEdit) => {

          const languageId = editor.document.languageId;
          let commentStart = '/*\n';
          let commentEnd = '\n*/';
          let linePrefix = '';


          if (['python', 'ruby', 'shellscript', 'yaml'].includes(languageId)) {
            commentStart = '';
            commentEnd = '';
            linePrefix = '# ';
          } else if (['html', 'xml'].includes(languageId)) {
            commentStart = '<!--\n';
            commentEnd = '\n-->';
          } else if (['javascript', 'typescript', 'java', 'c', 'cpp', 'csharp', 'php', 'go', 'rust'].includes(languageId)) {
            commentStart = '/*\n';
            commentEnd = '\n*/';
          } else {

             commentStart = '';
             commentEnd = '';
          }

          let formattedData = data;
          if (linePrefix) {
             formattedData = data.split('\n').map((line: string) => linePrefix + line).join('\n');
          }
          
          const finalOutput = `${commentStart}${formattedData}${commentEnd}`;
          editBuilder.replace(selection, finalOutput);
        });
      }
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
