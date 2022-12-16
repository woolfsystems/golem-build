import {blue, bold, green, red} from 'cli-color'
import {ChildProcess, spawn} from 'node:child_process'

export class ChildWatchCommand {
  private app: ChildProcess | undefined
  private watchCommand: string
  private startCount = 0

  constructor(watchCommand: string) {
    this.watchCommand = watchCommand
  }

  start(): void {
    console.log(`[${green('-')}] starting ${bold(this.watchCommand)}`)
    this.app = this.runWatchCommand(this.watchCommand)
    this.app.on('message', (event: Event) => {
      if (event.type === 'start') {
        this.startCount++
        console.log(`[${green('+')}] ${this.startCount > 1 ? 'restarted' : 'started'} ${bold(this.watchCommand)}`)
      } else if (event.type === 'crash') {
        console.log(`[${red('!')}] crashed ${bold(this.watchCommand)}`)
      } else {
        console.log(`[${blue('?')}] info ${bold(this.watchCommand)}: ${JSON.stringify(event)}`)
      }
    })
  }

  exit(): void {
    if (this?.app) {
      console.log(`[${green('+')}] exiting: ${this.watchCommand}`)
      this.app.send('quit')
    }
  }

  runWatchCommand(watchCmd: string): ChildProcess {
    const [cmd, ...params] = watchCmd.split(' ')

    const childProcess = spawn(cmd, params, {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    })

    return childProcess
  }
}
