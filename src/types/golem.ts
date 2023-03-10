/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable unicorn/no-array-reduce */
import {blue, bold, green, red} from 'cli-color'
import {build, BuildFailure, BuildOptions, BuildResult, LogLevel} from 'esbuild'
import {EventEmitter} from 'node:stream'
import {ChildWatchCommand} from '../lib/child-watch-command'

const defaultBuild = {
  logLevel: 'silent' as LogLevel,
}

export interface GolemOptions {
  watchCmd?: string
}

export interface GolemBuildJob {
  id: string
  build: GolemBuildOptions
  watchChildProcess?: ChildWatchCommand
}

type GolemBuildOptions = BuildOptions & GolemOptions

export interface GolemProjectDefinition {
  outDir: string
  baseDir: string
  builds: Record<string, GolemBuildOptions>
}

export interface GolemBuildEvent {
  data: any
}

export interface GolemProjectOptions {
  outDir: string
  baseDir: string
}

export class GolemProject {
  options: GolemProjectOptions
  builds: GolemBuild[]

  constructor(projectDef: GolemProjectDefinition) {
    const {outDir, baseDir, builds} = projectDef
    this.options = {
      outDir,
      baseDir,
    }
    this.builds = Object.keys(builds).map((key: string) =>
      new GolemBuild(key, builds[key], this.options))
  }

  watchBuild(build: GolemBuild): Promise<any> {
    console.log(`[${blue('i')}] (${bold(build.id)}) watch`)

    return new Promise((resolve, reject) => {
      build.watch()
      .then((result: BuildResult) => {
        if (build?.watchCmd) {
          const watcher = new ChildWatchCommand(build.id, build.watchCmd)
          watcher.start(build).then(() => {
            resolve([build.id, build, 'ok'])
          }).catch(error => {
            reject([build.id, build, error])
          }).finally(() => {
            if (result?.stop !== undefined)
              result.stop()
          })
        } else {
          console.log(`[${green('+')}] (${bold(build.id)}) no watch command`)
          resolve([build.id, build, result])
        }
      })
      .catch((error: BuildFailure) => {
        reject([build.id, build, error])
      })
    })
  }

  runBuild(build: GolemBuild): Promise<any> {
    console.log(`[${blue('i')}] (${bold(build.id)}) start`)

    return new Promise((resolve, reject) => {
      build.run()
      .then((result: BuildResult) =>
        resolve([build.id, build, result]))
      .catch((error: BuildFailure) => {
        const errorMessages = error?.errors.map(error => (error !== undefined && (error?.text || ''))).join(' ,')
        console.log(`[${red('!')}] (${bold(build.id)}) build failed: ${errorMessages}`)
        reject([build.id, build, error])
      })
    })
  }
}

export class GolemBuild {
  private options: GolemBuildOptions
  public id: string
  public eventEmitter: EventEmitter
  public watchCmd?: string

  constructor(id: string, buildOptions: GolemBuildOptions, projectOptions: GolemProjectOptions) {
    this.id = id
    this.options = this.mapOptions(buildOptions, projectOptions)
    this.watchCmd = buildOptions?.watchCmd
    this.eventEmitter = new EventEmitter()
  }

  mapOptions(buildOptions: GolemBuildOptions, projectOptions: GolemProjectOptions) : BuildOptions {
    const {
      baseDir,
      outDir,
    } = projectOptions
    const {
      target,
      outfile,
      platform = 'browser',
      bundle = false,
      minify = false,
      sourcemap = false,
    } = buildOptions
    const _entryPoints = buildOptions.entryPoints || []

    const entryPoints = Array.isArray(_entryPoints) ?
      _entryPoints.map(entryPoint =>
        `${baseDir}/${entryPoint}`) :
      Object.keys(_entryPoints as Record<string, string>).reduce((allEntries, entry: string) => {
        return {
          ...allEntries,
          [entry]: `${baseDir}/${_entryPoints[entry] as string}`,
        }
      }, {} as Record<string, string>)

    const appBuild = {
      target,
      sourcemap,
      platform,
      bundle,
      minify,
      entryPoints,
      outfile: `${outDir}/${outfile}`,
      ...defaultBuild,
    }

    return appBuild
  }

  emit(type: string, event: GolemBuildEvent): void {
    this.eventEmitter.emit(type, event)
  }

  run(): Promise<BuildResult> {
    return build(this.options)
  }

  watch(): Promise<BuildResult> {
    return build({
      ...this.options,
      watch: {
        onRebuild: (error: BuildFailure|null, _result: BuildResult|null) => {
          if (error) {
            this.emit('build:error', {data: error})
            console.log(`[${red('!')}] (${bold(this.id)}) watch build: ${error}`)
          } else {
            this.emit('build:success', {data: error})
            console.log(`[${green('+')}] (${bold(this.id)}) watch build: ok`)
          }
        },
      },
    })
  }

  stopWatch(): void {
    //
  }
}
