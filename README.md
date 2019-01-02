# ZenScript

ZenScript is a vscode plugin for CraftTweaker ZenScript.

## Features

- Auto Completion
- Code Snippets
- Syntax Highlight

## Requirements

You need to have [our Minecraft Mod](https://github.com/Yesterday17/Probe) installed to have better experience.

## Extension Settings

This extension contributes the following settings:

- `zenscript.maxHistoryEntries`: Controls the maximum number of history entries responsed by the server.

## Known Issues

- Changes made in `.zsrc` can only be applied if the language server is started, which means you must open a `.zs` file to apply it.
- The autocompletion can only be triggered in specific ways.
- `yarn package` can't work. See [#606](https://github.com/ivogabe/gulp-typescript/issues/606).

## Release Notes

### 0.0.1

Basic utilities.
