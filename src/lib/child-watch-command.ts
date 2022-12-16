import {ChildProcess, spawn} from 'node:child_process'

export class ChildWatchCommand {
  private app: ChildProcess | undefined
  private watchCommand: string

  constructor(watchCommand: string) {
    this.watchCommand = watchCommand
  }

  start(): void {
    this.app = this.runWatchCommand(this.watchCommand)
    this.app.on('message', (event: Event) => {
      if (event.type === 'start') {
        console.log('nodemon started')
      } else if (event.type === 'crash') {
        console.log('script crashed for some reason')
      }
    })
  }

  exit(): void {
    if (this?.app)
      this.app.send('quit')
  }

  runWatchCommand(watchCmd: string): ChildProcess {
    const [cmd, ...params] = watchCmd.split(' ')

    const childProcess = spawn(cmd, params, {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    })

    return childProcess
  }
}
