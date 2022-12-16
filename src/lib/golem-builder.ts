/* eslint-disable unicorn/no-useless-undefined */
/* eslint-disable unicorn/no-array-reduce */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable unicorn/no-array-for-each */
import {build, LogLevel, BuildOptions, BuildFailure, BuildResult} from 'esbuild'
import {green, red, blue, bold} from 'cli-color'
import {readFile} from 'node:fs/promises'
import {ChildWatchCommand} from './child-watch-command'

export const DEFAULT_CONFIG_PATH = 'config.golem.json'

export interface GolemOptions {
  watchCmd?: string
}

export interface GolemProject {
    outDir: string
    baseDir: string
    watchMode?: boolean
    builds: Record<string, BuildOptions & GolemOptions>
}

const defaultBuild = {
  logLevel: 'silent' as LogLevel,
}

export const loadProjectFile = async (fileName: string): Promise<GolemProject> => {
  const fileContents = await readFile(fileName, {encoding: 'utf-8'})
  const projectDefinition = JSON.parse(fileContents)
  return projectDefinition
}

// const startTime = process.hrtime()
export const buildProject = (projectDef: GolemProject, watch?: boolean): Promise<[string, undefined|ChildWatchCommand][]> =>
  new Promise((resolve, reject) => {
    const {baseDir, outDir, builds} = projectDef as GolemProject
    const buildList = Object.keys(builds).map(key => {
      const {
        target = undefined,
        outfile,
        platform = 'browser',
        bundle = false,
        minify = false,
        sourcemap = false,
      } = builds[key]
      const _entryPoints = builds[key].entryPoints || []

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
        watch: watch ? {
          onRebuild(error: BuildFailure|null, _result: BuildResult|null) {
            if (error) {
              console.log(`[${red('!')}] (${bold(key)}) watch build: ${error}`)
            } else {
              console.log(`[${green('+')}] (${bold(key)}) watch build: ok`)
            }
          },
        } : undefined,
      }

      console.log(`[${blue('-')}] (${bold(key)}) ${watch ? 'watch' : 'start'}`)

      return build(appBuild)
      .then((result: BuildResult) =>
        [key, result])
      .catch((error: BuildFailure) => {
        reject([key, error])
      })
    })

    Promise.allSettled(buildList).then(resultList => {
      const buildHandlerList: [string, undefined|ChildWatchCommand][] = resultList.map((buildResult: {status: string, value?: any}) => {
        const [key] = buildResult?.value || ['unknown', undefined]
        if (buildResult?.value === undefined) {
          return [key, undefined]
        }

        const project = projectDef.builds[key]

        console.log(`[${green('+')}] (${bold(key)}) ${watch ? 'watching' : 'built'}`)
        if (watch && project?.watchCmd) {
          const watcher = new ChildWatchCommand(key, project.watchCmd)
          watcher.start()
          return [key, watcher]
        }

        return [key, undefined]
        // console.dir(buildResult)
      })
      resolve(buildHandlerList)
    })
  })

// buildProject(local_project_def as GolemProject).then(()=>{
//     const [endTimeSs,endTimeNs] = process.hrtime(startTime)
//     const endTimeMs = (endTimeNs / 1000000).toFixed(2)
//     console.log(`[${clc.yellowBright('=')}] ${endTimeSs>0?`${endTimeSs}s `:''}${endTimeMs}ms`)
// }).catch(([buildKey,buildFailure])=>{
//     for(let key in buildFailure.errors){
//         console.log(`[${clc.red('!')}] build ${clc.bold(buildKey)} error: ${buildFailure.errors[key].text}`)
//     }
//     console.log(`[${clc.red('=')}] terminating early`)
//     process.exit(1)
// })
