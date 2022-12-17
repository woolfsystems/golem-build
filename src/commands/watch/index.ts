/* eslint-disable guard-for-in */
import {Command, Flags} from '@oclif/core'
import {buildProject, loadProjectFile, DEFAULT_CONFIG_PATH} from '../../lib/golem-builder'
import {red, bold, yellow, white} from 'cli-color'

export default class Watch extends Command {
  static description = 'Build project in watch mode'

  static examples = [
    '$ golem watch --config ./other.golem.json',
  ]

  static flags = {
    config: Flags.string({char: 'c', description: `Project file if not ${DEFAULT_CONFIG_PATH}`, required: false}),
  }

  static args = []

  async run(): Promise<any> {
    console.log(`${white.bold('golem')}${yellow('@')}${this.config.version}`)
    const {flags} = await this.parse(Watch)
    const projectDefinition = await loadProjectFile(flags?.config || DEFAULT_CONFIG_PATH)

    buildProject(projectDefinition, true)
    .catch(([buildKey, _, buildFailure]) => {
      for (const key in buildFailure.errors) {
        console.log(`[${red('!')}] (${bold(buildKey)}) build error: ${buildFailure.errors[key].text}`)
      }

      console.log(`[${red('=')}] terminating early`)
    })
    .then(() => {
      // wait for child processes
    })
  }

  async catch(error: Error): Promise<void> {
    console.log(`[${red('!')}] error: ${error.toString()}`)
    throw error
  }
}
