/* eslint-disable guard-for-in */
import {Command, Flags} from '@oclif/core'
import {buildProject, loadProjectFile} from '../../lib/golem-builder'
import {red, bold, white, yellow} from 'cli-color'
export default class Build extends Command {
  static description = 'Build project'

  static examples = [
    '$ golem build --config ./other.golem.ts',
  ]

  static flags = {
    config: Flags.string({char: 'c', description: 'Project file if not config.golem.ts', required: false}),
  }

  static args = []

  async run(): Promise<any> {
    const VERSION = '0.0.1'
    console.log(`${white.bold('golem')}${yellow('@')}${VERSION}`)
    const {flags} = await this.parse(Build)
    const projectDefinition = await loadProjectFile(flags?.config || './config.golem.json')

    buildProject(projectDefinition).catch(([buildKey, buildFailure]) => {
      for (const key in buildFailure.errors) {
        console.log(`[${red('!')}] build ${bold(buildKey)} error: ${buildFailure.errors[key].text}`)
      }

      console.log(`[${red('=')}] terminating early`)
    })
  }
}
