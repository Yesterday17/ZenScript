# ZenScript

[![](https://img.shields.io/badge/chat-on%20disord-green.svg?logo=discord)](https://discord.gg/R7wH4Kd)

ZenScript is a vscode plugin for [CraftTweaker](https://crafttweaker.readthedocs.io/en/latest/) [ZenScript](https://github.com/CraftTweaker/ZenScript).

## Features

- Syntax Highlight
- Code Snippets
- BracketHandler Completion
- Priority Tree
- Remote FileSystem Support
- Manual import autocomplete
- History Entries(WIP)

## Requirements

You **must** have [this Minecraft Mod](https://github.com/Yesterday17/Probe) installed to have use most features of this plugin.  
If you're just editing `.zs` files, you can only have syntax highlight and simple code snippets.

## Probe Version Map

The following table shows the version of `Probe` used in different `Zenscript` versions:

| Probe                                                                      | ZenScript       | Compatable with previous ZenScript version |
| -------------------------------------------------------------------------- | --------------- | ------------------------------------------ |
| [0.1.23](https://www.curseforge.com/minecraft/mc-mods/probe/files/2898087) | 0.1.41~         | `true`                                     |
| [0.1.20](https://minecraft.curseforge.com/projects/probe/files/2682736)    | 0.1.31 ~ 0.1.40 | `true`                                     |
| [0.1.19](https://minecraft.curseforge.com/projects/probe/files/2682564)    | 0.1.30          | `true`                                     |
| [0.1.18](https://minecraft.curseforge.com/projects/probe/files/2677354)    | 0.1.25 ~ 0.1.29 | `true`                                     |
| [0.1.17](https://minecraft.curseforge.com/projects/probe/files/2671457)    | 0.1.22 ~ 0.1.24 | `Partially`                                |
| [0.1.16](https://minecraft.curseforge.com/projects/probe/files/2666387)    | 0.1.10 ~ 0.1.21 | `NO_PREVIOUS_VERSION`                      |

## Extension Settings

This extension contributes the following settings:

- `zenscript.maxNumberOfProblems`: Controls the maximum number of problems produced by the server.
- `zenscript.maxHistoryEntries`: Controls the maximum number of history entries responsed by the server.
- `zenscript.showIsProjectWarn`: Whether to show warning of isProject.
- `zenscript.modIdItemCompletion`: Whether to show modid autocompletion with bracketHandlers.
- `zenscript.trace.server`: Traces the communication between VS Code and the language server.

## Known Issues

- The brackets of `if (expression)` are required. (#5)

## Special Thanks
- Highlight: https://github.com/Jandakast/ZenScript-VSCodeLanguage

## Release Notes

### 0.0.1

Basic utilities.
