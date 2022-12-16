/* eslint-disable guard-for-in */
import {Command, Flags} from '@oclif/core'
import {buildProject, DEFAULT_CONFIG_PATH, loadProjectFile} from '../../lib/golem-builder'
import {red, bold, white, yellow} from 'cli-color'
export default class Build extends Command {
  static description = 'Build project'

  static examples = [
    '$ golem build --config ./other.golem.json',
  ]

  static flags = {
    config: Flags.string({char: 'c', description: `Project file if not ${DEFAULT_CONFIG_PATH}`, required: false}),
  }

  static args = []

  async run(): Promise<any> {
    console.log(`${white.bold('golem')}${yellow('@')}${this.config.version}`)
    const {flags} = await this.parse(Build)
    const projectDefinition = await loadProjectFile(flags?.config || DEFAULT_CONFIG_PATH)

    buildProject(projectDefinition).catch(([buildKey, buildFailure]) => {
      for (const key in buildFailure.errors) {
        console.log(`[${red('!')}] build ${bold(buildKey)} error: ${buildFailure.errors[key].text}`)
      }

      console.log(`[${red('=')}] terminating early`)
    })
  }
}
