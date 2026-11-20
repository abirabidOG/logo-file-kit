# Logo File Kit plugin for Claude Code

Export a logo to transparent PNG sizes without leaving the terminal. Free,
local, no sign-up, nothing uploaded.

## Install

In Claude Code:

```text
/plugin marketplace add abirabidOG/logo-file-kit
/plugin install logo-file-kit@logo-file-kit
```

First run only: the skill installs its export engine once, from the plugin
folder:

```bash
cd <plugin-dir>
npm install
```

## Use

```text
/export-logo logo.svg
/export-logo logo.png --sizes 16,32,180,512,1024,2000
/export-logo logo.jpg --background white --padding 10
```

Or ask Claude in plain words: "export this logo to all the usual sizes".
Default output is the web tool's full set (16, 32, 48, 64, 256, 300, 400,
512, 1024, 2000), written to `./logo-kit` with the same file names as the
web tool, including `logo-print-master-2000.png` for print.

## How it works

The plugin ships a skill (`skills/logo-file-kit/SKILL.md`), a slash command
(`/export-logo`), and a small Node script (`scripts/export.cjs`) built on
sharp. Exporting runs entirely on your machine. The script prints real
numbers only: dimensions, channels, alpha, and file sizes.

## What it does not do (v1)

- PNG output only. JPG and WebP export live in the web tool.
- One logo per run, no multi logo batch.

## Web version

The same export set with a visual interface, live preview, background and
padding controls, and Download All as ZIP:
https://tools.abidmahmud.cv/logo-kit

## Licence

MIT. By Abid Mahmud, https://www.abidmahmud.cv
