# PPM Viewer

PPMViewer reads and a PPM file and renders it to a webview.

## Features

* Supports PPM files
* Currently it only supports ASCII characters and does not validate color values.

<!-- Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow. -->

<!-- ## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them. -->

<!-- ## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something -->

## Known Issues

<!-- Calling out known issues can help limit users opening duplicate issues against your extension. -->

* Moving the tab too many times can cause the ppm file to stop displaying until the tab is closed and reopened.

## Extension Commands

This extension has the following commands:

* `ppmviewer.viewppm`: View PPM File

## Release Notes

<!-- Users appreciate release notes as you update your extension. -->

### 1.2.0

Fixed the viewppm command not working due to the command not knowing what file to view.

### 1.1.1

Fixed security vulnerabilities with npm modules.

### 1.1.0

Fixed support for large PPM files

### 1.0.0

Initial release of PPMViewer

### Visual Studio Marketplace

This extension is available on the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=AYH.ppmviewer) for Visual Studio Code

<!-- ### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z. -->

-----------------------------------------------------------------------------------------------------------

<!-- ## Working with Markdown

**Note:** You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
* Toggle preview (`Shift+CMD+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
* Press `Ctrl+Space` (Windows, Linux) or `Cmd+Space` (macOS) to see a list of Markdown snippets

### For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/) -->