import {blue, bold, green, red} from 'cli-color'
import {ChildProcess, spawn} from 'node:child_process'

const VERBOSE_LOGGING = false

interface ChildEvent {
  type: 'start'|'crash'|'log'|'info'
  data?: Record<string, any>
}

export class ChildWatchCommand {
  private app: ChildProcess | undefined
  private watchCommand: string
  private buildKey: string
  private startCount = 0

  constructor(buildKey: string, watchCommand: string) {
    this.buildKey = buildKey
    this.watchCommand = watchCommand
  }

  start(): void {
    console.log(`[${green('-')}] (${bold(this.buildKey)}) starting ${bold(this.watchCommand)}`)
    this.app = this.runWatchCommand(this.watchCommand)
    this.app.on('message', (event: ChildEvent) => {
      switch (event.type) {
      case 'start': {
        this.startCount++
        console.log(`[${green('+')}] (${bold(this.buildKey)}) ${this.startCount > 1 ? 'restarted' : 'started'} ${bold(this.watchCommand)}`)
        break
      }

      case 'crash': {
        console.log(`[${red('!')}] (${bold(this.buildKey)}) crashed ${bold(this.watchCommand)}`)
        break
      }

      case 'log': {
        console.log(`[${blue('?')}] (${bold(this.buildKey)}) log ${bold(this.watchCommand)}: ${JSON.stringify(event?.data?.colour || event)}`)
        break
      }

      default: {
        if (VERBOSE_LOGGING) {
          console.log(`[${blue('?')}] (${bold(this.buildKey)}) verbose ${bold(this.watchCommand)}: ${JSON.stringify(event?.data || event)}`)
        }

        break
      }
      // No default
      }
    })
  }

  exit(): void {
    if (this?.app) {
      console.log(`[${green('+')}] (${bold(this.buildKey)}) exiting: ${this.watchCommand}`)
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
