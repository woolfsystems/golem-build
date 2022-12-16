import {blue, bold, green, red} from 'cli-color'
import {ChildProcess, spawn} from 'node:child_process'

const VERBOSE_LOGGING = false

interface ChildEvent {
  type: 'start'|'crash'|'log'|'info'
  data?: Record<string, any>
  message?: string
}

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
    this.app.on('message', (event: ChildEvent) => {
      switch (event.type) {
      case 'start': {
        this.startCount++
        console.log(`[${green('+')}] ${this.startCount > 1 ? 'restarted' : 'started'} ${bold(this.watchCommand)}`)
        break
      }

      case 'crash': {
        console.log(`[${red('!')}] crashed ${bold(this.watchCommand)}`)
        break
      }

      case 'info': {
        console.log(`[${blue('?')}] info ${bold(this.watchCommand)}: ${JSON.stringify(event?.message || event)}`)
        break
      }

      case 'log': {
        console.log(`[${blue('?')}] log ${bold(this.watchCommand)}: ${JSON.stringify(event?.data || event)}`)
        break
      }

      default: {
        if (VERBOSE_LOGGING) {
          console.log(`[${blue('?')}] verbose ${bold(this.watchCommand)}: ${JSON.stringify(event?.data || event)}`)
        }

        break
      }
      // No default
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
