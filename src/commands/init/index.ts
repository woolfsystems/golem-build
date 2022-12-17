import {Command, Flags} from '@oclif/core'
import {writeProjectFile, DEFAULT_CONFIG_PATH} from '../../lib/golem-builder'
import {green, red, white, yellow} from 'cli-color'
import {existsSync} from 'node:fs'
export default class Init extends Command {
  static description = 'Initialise project'

  static examples = [
    '$ golem init <BASE_DIR> <OUT_DIR>',
  ]

  static flags = {
    config: Flags.string({char: 'c', description: `Project file if not ${DEFAULT_CONFIG_PATH}`, required: false}),
  }

  static args = [
    {name: 'baseDir'},
    {name: 'outDir'},
  ]

  async run(): Promise<any> {
    console.log(`${white.bold('golem')}${yellow('@')}${this.config.version}`)
    const {args, flags} = await this.parse(Init)
    const configPath = flags?.config || DEFAULT_CONFIG_PATH
    if (existsSync(configPath)) {
      throw new Error('config file already exists')
    }

    if (args?.baseDir === undefined) {
      throw new Error('no base directory provided')
    }

    if (args?.outDir === undefined) {
      throw new Error('no output directory provided')
    }

    if (!existsSync(args.baseDir)) {
      throw new Error("base directory doesn't exist")
    }

    const projectDef = {
      baseDir: args.baseDir,
      outDir: args.outDir,
      builds: {},
    }

    writeProjectFile(DEFAULT_CONFIG_PATH, projectDef)
    console.log(`[${green('+')}] initialised config at '${configPath}'`)
  }

  async catch(error: Error): Promise<void> {
    console.log(`[${red('!')}] error: ${error.toString()}`)
  }
}
