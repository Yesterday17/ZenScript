# ZenScript

ZenScript is a vscode plugin for [CraftTweaker](https://crafttweaker.readthedocs.io/en/latest/) [ZenScript](https://github.com/CraftTweaker/ZenScript).

## Features

- Auto Completion
- Code Snippets
- Syntax Highlight
- History Entries

## Requirements

You **must** have [this Minecraft Mod](https://github.com/Yesterday17/Probe) installed to have use most features of this plugin.
If you're just editing `.zs` files, you can have syntax highlight and simple code snippets.

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
