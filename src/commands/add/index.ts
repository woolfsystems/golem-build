import {Command} from '@oclif/core'
import {existsSync} from 'node:fs'
import {createPromptModule} from 'inquirer'
import {DEFAULT_CONFIG_PATH, loadProjectFile, writeProjectFile} from '../../lib/golem-builder'
import {white, yellow} from 'cli-color'

export class Add extends Command {
  static description = 'add a build to the project'

  async run() {
    console.log(`${white.bold('golem')}${yellow('@')}${this.config.version}`)
    // const {flags} = await this.parse(Add)
    const projectDef = await loadProjectFile(DEFAULT_CONFIG_PATH)

    const prompt = createPromptModule()
    const {name, platform, outfile, bundle, minify, entrypoint, sourcemap} = await prompt([
      {
        name: 'name',
        message: 'enter a name for the build',
        type: 'input',
        validate: _name => {
          const name = _name.trim()
          if (Object.keys(projectDef.builds).includes(name)) {
            return 'there is already a build with this name'
          }

          if (name.length === 0) {
            return 'name must be longer than 1 character'
          }

          return true
        },
      },
      {
        name: 'platform',
        message: 'what is the build target',
        type: 'list',
        choices: ['browser', 'node'],
      },
      {
        name: 'entrypoint',
        message: 'enter the path to the entrypoint (eg. client/index.tsx)',
        type: 'input',
        validate: path =>
          existsSync(path) ? true : "file doesn't exist",
      },
      {
        name: 'outfile',
        message: 'enter the path to the output (eg. dist/index.js)',
        type: 'input',
      },
      {
        name: 'bundle',
        message: 'do you want the output bundled',
        type: 'confirm',
      },
      {
        name: 'minify',
        message: 'do you want the output minified',
        type: 'confirm',
        default: false,
      },
      {
        name: 'sourcemap',
        message: 'do you want a sourcemap',
        type: 'confirm',
        default: false,
      },
    ])

    projectDef.builds = {
      ...projectDef.builds,
      [name]: {
        platform,
        entryPoints: [entrypoint],
        outfile,
        bundle,
        minify,
        sourcemap,
      },
    }

    writeProjectFile(DEFAULT_CONFIG_PATH, projectDef)
    // stage = responses.stage
    // this.log(`the stage is: ${stage}`)
  }
}
