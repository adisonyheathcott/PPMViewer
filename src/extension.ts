// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { URI } from 'vscode-uri';
import * as readline from 'readline';

const cats = {
	'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif'
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Track the current webview panel
	let currentPanel : vscode.WebviewPanel | undefined = undefined;

	// Register the command into the context
	context.subscriptions.push(
		vscode.commands.registerCommand('ppmviewer.viewppm', (uri?: vscode.Uri) => {
			const columnToShowIn = vscode.window.activeTextEditor
				? vscode.window.activeTextEditor.viewColumn
				: undefined;

			if (currentPanel) {
				// Show the panel in the target column
				currentPanel.reveal(columnToShowIn);
			} else {
				// Otherwise create a new panel
				currentPanel = vscode.window.createWebviewPanel(
					'ppmview',			// Identifies the type of webview, used internally
					'PPM View',			// Title of the panel displayed to the user
					columnToShowIn ? columnToShowIn : vscode.ViewColumn.One,
					{
						// Enable scripts in the webview
						enableScripts: true
					}
				);

				// Reset when the current panel is closed
				currentPanel.onDidDispose(
					() => {
						currentPanel = undefined;
					},
					null,
					context.subscriptions
				);

				// Update contents based on view state changes
				currentPanel.onDidChangeViewState(
					() => {
						currentPanel ? currentPanel.webview.postMessage({ command: 'draw' }) : null;
					},
					null,
					context.subscriptions
				);
			}

			const path = uri?.fsPath != undefined ? uri.fsPath : "";
			const stream = fs.createReadStream(URI.parse(path).path, { encoding: 'utf-8' });

			var lineReader = readline.createInterface({
				input: stream
			});
			
			// Canvas dimensions
			var width = 0;
			var height = 0;

			var lineNum = 0;
			var pixArray : Uint8ClampedArray;
			var i = 0;	// Index into pixel array

			lineReader.on('line', function (line) {
				if (lineNum == 0) {
					if (line != "P3") {
						console.error("Only ASCII is currently supported.");
						return;
					}
				} else if (lineNum == 1) {
					// Get the two numbers from the line string
					let result = line.match(/\d+/g)?.map(n => parseInt(n));

					// Get the width and height from the result and validate
					width = result != undefined ? result[0] : 0;
					height = result != undefined ? result[1] : 0;
					
					if (width == 0 || height == 0) {
						console.error("Image dimensions have to be a non-zero number.");
						return;
					}

					// Create a vector of size (width * height) * 3 - 3 values per pixel
					pixArray = new Uint8ClampedArray((width * height) * 4);

					currentPanel ? currentPanel.webview.html = getWebviewContent(width, height) : null;
				} else if (lineNum == 2) {
					// TODO - read in the max value and validate
				} else {
					// Get the numbers from the file
					let result = line.match(/\d+/g)?.map(n => parseInt(n));
					
					// Write the red byte
					pixArray[i] = result != undefined ? result[0] : 0;
					i++;
					
					// Write the green byte
					pixArray[i] = result != undefined ? result[1] : 0;
					i++;
					
					// Write the blue byte
					pixArray[i] = result != undefined ? result[2] : 0;
					i++;

					// Write the alpha byte
					pixArray[i] = 255;
					i++;
					
					if (i == (width * height) * 4) {
						console.log("POSTED");
						currentPanel ? currentPanel.webview.postMessage({ command: 'pixArray', pixs: pixArray }) : null;
					}
				}
				
				lineNum++;
			});

		})
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function getWebviewContent(width: number, height: number) {
	return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>PPM Viewer</title>
	</head>
	<script>
		var draw = function() {
			window.canvas = document.getElementById('rasterCanvas');
			var ctx = window.canvas.getContext('2d');

			window.canvas.style.width = window.innerWidth + "px";
			window.canvas.style.height = (window.innerWidth / (window.canvas.width / window.canvas.height)) + "px";
			window.canvas.style.left = "0px";
			window.canvas.style.top = "0px";
			window.canvas.style.position = "absolute";

			var imageData = ctx.getImageData(0, 0, window.canvas.width, window.canvas.height);
			var data = imageData.data;

			for (var i = 0; i < data.length; i += 4) {
				data[i] = window.pixelArray[i];
				data[i + 1] = window.pixelArray[i + 1];
				data[i + 2] = window.pixelArray[i + 2];
				data[i + 3] = window.pixelArray[i + 3];
			}

			ctx.putImageData(imageData, 0, 0);

		}

		window.addEventListener('message', event => {
			switch (event.data.command) {
				case 'pixArray':
					window.pixelArray = event.data.pixs;
					draw();
					break;

				case 'draw':
					draw();
					break;
			}
		});
	</script>
	<body>
		<canvas id="rasterCanvas" width="${width}" height="${height}" style="width: ${width}px; height: ${height}px;"></canvas>
	</body>
	</html>
	`;
}

// Create and show a new webview
// const panel = vscode.window.createWebviewPanel(
// 	'ppmview', 				// Identifies the type of webview. Used internally
// 	'PPM View',				// Title of the panel displayed to the user
// 	vscode.ViewColumn.One,	// Editor column to show the new webview
// 	{
// 		// Enable scripts in the webview
// 		enableScripts: true
// 	}
// );