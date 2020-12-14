// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';

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

			if (!uri) {
				uri = vscode.window.activeTextEditor?.document.uri;
			}

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

			// -------- //

			// Pixel array
			var width = 0;
			var height = 0;
			var maxPix = 0;
			var pixArray : Uint8ClampedArray;
			var pixInd = 0;

			// File stream
			const p = uri?.fsPath != undefined ? uri.fsPath : "";
			const s = fs.createReadStream(p, { encoding: 'ascii' });
			var data = '';
			s.on('data', function(chunk: string) {
				data += chunk;
			});

			s.on('end', function() {
				var c = data.replace(/\s+/g, ' ').trim().split(' ');
				
				// Check for file format identifier
				if (c[0] !== 'P3') {
					console.log("Invalid PPM file.");
					return;
				}

				// Get the width and height
				width = parseInt(c[1]);
				height = parseInt(c[2]);
				if (width == 0 || height == 0) {
					console.error("Image dimensions have to be a non-zero number.");
					return;
				}

				// Create the pixel array
				pixArray = new Uint8ClampedArray((width * height) * 4);

				currentPanel ? currentPanel.webview.html = getWebviewContent(width, height) : null;

				maxPix = parseInt(c[3]);

				for (var i = 4; i < c.length; i += 3) {
					pixArray[pixInd] = parseInt(c[i]);
					pixArray[pixInd + 1] = parseInt(c[i + 1]);
					pixArray[pixInd + 2] = parseInt(c[i + 2]);
					pixArray[pixInd + 3] = 255;
				 	pixInd += 4;
				}

				currentPanel ? currentPanel.webview.postMessage(Array.from(pixArray)) : null;
			});

			s.on('error', function(err) {
				console.log(err.stack);
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
		window.addEventListener('message', event => {
			switch (event.data.command) {
				default:
					const vscode = acquireVsCodeApi();
					window.canvas = document.getElementById('rasterCanvas');
					
					window.canvas.style.width = ${width} + "px";
					window.canvas.style.height = ${height} + "px";
					window.canvas.style.left = "0px";
					window.canvas.style.top = "0px";
					window.canvas.style.position = "absolute";
					
					var ctx = window.canvas.getContext('2d', { alpha: false });
					
					var viewData = Uint8ClampedArray.from(event.data);
					let imageData = new ImageData(viewData, window.canvas.width, window.canvas.height);
					ctx.putImageData(imageData, 0, 0);

					return;
			}
		});
	</script>
	<body>
		<canvas id="rasterCanvas" width="${width}" height="${height}" style="width: ${width}px; height: ${height}px;"></canvas>
	</body>
	</html>
	`;
}