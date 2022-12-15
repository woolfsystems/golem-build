Golem
=================

esbuild project manager

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/@fnord/golem)
<!-- [![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main) -->
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/@fnord/golem)
<!-- [![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json) -->

<!-- toc -->
* [Usage](#usage)
* [Configuration](#configuration)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @fnord/golem
$ golem COMMAND
running command...
$ golem (--version)
@fnord/golem/0.2.1 linux-x64 node-v16.18.0
$ golem --help [COMMAND]
USAGE
  $ golem COMMAND
...
```
<!-- usagestop -->
---
# Configuration
If you had a `src` folder with 2 subfolders: client, and server, you might configure your project by putting the following in `config.golem.json` at the root of your project:
```json
{
    "baseDir": "src",
    "outDir": "dist",
    "watchMode": true,
    "builds": {
        "frontend": {
            "entryPoints": ["server/index.ts"],
            "bundle": true,
            "outfile": "index.js",
            "platform": "node"
        },
        "backend": {
            "entryPoints": ["client/index.tsx"],
            "bundle": true,
            "outfile": "public/index.js",
            "requires": ["frontend"],
            "watch": "nodemon"
        }
    }
}
```
### Global Properties
#### baseDir
the directory to prepend to all build entrypoints.
#### outDir
the directory to prepend to all build outputs.
#### builds
an object containing the distinct builds, for example frontend and backend.
### Build Properties
#### entryPoints
an array containing the build entrypoints.
#### bundle
enable bundling of output into a single file.
#### outfile
the destination file or file pattern for non-bundled builds.
<!-- #### requires // TODO -->
<!-- array of builds that are required to execute the result of this build. -->

---
# Commands
<!-- commands -->
* [`golem build`](#golem-build)
* [`golem help [COMMAND]`](#golem-help-command)
* [`golem plugins`](#golem-plugins)
* [`golem plugins:install PLUGIN...`](#golem-pluginsinstall-plugin)
* [`golem plugins:inspect PLUGIN...`](#golem-pluginsinspect-plugin)
* [`golem plugins:install PLUGIN...`](#golem-pluginsinstall-plugin-1)
* [`golem plugins:link PLUGIN`](#golem-pluginslink-plugin)
* [`golem plugins:uninstall PLUGIN...`](#golem-pluginsuninstall-plugin)
* [`golem plugins:uninstall PLUGIN...`](#golem-pluginsuninstall-plugin-1)
* [`golem plugins:uninstall PLUGIN...`](#golem-pluginsuninstall-plugin-2)
* [`golem plugins update`](#golem-plugins-update)
* [`golem watch`](#golem-watch)

## `golem build`

Build project

```
USAGE
  $ golem build [-c <value>]

FLAGS
  -c, --config=<value>  Project file if not config.golem.ts

DESCRIPTION
  Build project

EXAMPLES
  $ golem build --config ./other.golem.ts
```

_See code: [dist/commands/build/index.ts](https://github.com/woolfsystems/golem-build/blob/v0.2.1/dist/commands/build/index.ts)_

## `golem help [COMMAND]`

Display help for golem.

```
USAGE
  $ golem help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for golem.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.19/src/commands/help.ts)_

## `golem plugins`

List installed plugins.

```
USAGE
  $ golem plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ golem plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.7/src/commands/plugins/index.ts)_

## `golem plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ golem plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ golem plugins add

EXAMPLES
  $ golem plugins:install myplugin 

  $ golem plugins:install https://github.com/someuser/someplugin

  $ golem plugins:install someuser/someplugin
```

## `golem plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ golem plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ golem plugins:inspect myplugin
```

## `golem plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ golem plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ golem plugins add

EXAMPLES
  $ golem plugins:install myplugin 

  $ golem plugins:install https://github.com/someuser/someplugin

  $ golem plugins:install someuser/someplugin
```

## `golem plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ golem plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ golem plugins:link myplugin
```

## `golem plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ golem plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ golem plugins unlink
  $ golem plugins remove
```

## `golem plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ golem plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ golem plugins unlink
  $ golem plugins remove
```

## `golem plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ golem plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ golem plugins unlink
  $ golem plugins remove
```

## `golem plugins update`

Update installed plugins.

```
USAGE
  $ golem plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

## `golem watch`

Build project in watch mode

```
USAGE
  $ golem watch [-c <value>]

FLAGS
  -c, --config=<value>  Project file if not golem.config.ts

DESCRIPTION
  Build project in watch mode

EXAMPLES
  $ golem watch --config ./other.ts
```

_See code: [dist/commands/watch/index.ts](https://github.com/woolfsystems/golem-build/blob/v0.2.1/dist/commands/watch/index.ts)_
<!-- commandsstop -->
