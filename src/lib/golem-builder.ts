/* eslint-disable prefer-promise-reject-errors */
import {build, BuildFailure, BuildResult} from 'esbuild'
import {green, blue, bold, red} from 'cli-color'
import {readFile} from 'node:fs/promises'
import {ChildWatchCommand} from './child-watch-command'
import {GolemBuildJob, GolemOptions, GolemProject, GolemProjectDefinition} from '../types/golem'
import {writeFileSync} from 'node:fs'

export const DEFAULT_CONFIG_PATH = 'config.golem.json'

export const loadProjectFile = async (fileName: string): Promise<GolemProjectDefinition> => {
  const fileContents = await readFile(fileName, {encoding: 'utf-8'})
  const projectDefinition = JSON.parse(fileContents)
  return projectDefinition
}

export const buildJob = async (_build: GolemOptions) => {
  //
}

export const watchJob = async (_build: GolemOptions) => {
  //
}

export const writeProjectFile = (path: string, projectDef: GolemProjectDefinition): void => {
  writeFileSync(path, JSON.stringify(projectDef, null, '  '))
}

// const startTime = process.hrtime()
export const buildProject = (projectDef: GolemProjectDefinition, watch?: boolean): Promise<GolemBuildJob[]> =>
  new Promise((resolve, reject) => {
    const project = new GolemProject(projectDef)
    // console.log('P', project)
    const buildList = project.builds.map(appBuild => {
      console.log(`[${blue('i')}] (${bold(appBuild.id)}) ${watch ? 'watch' : 'start'}`)

      if (watch)
        return appBuild.watch()
        .then((result: BuildResult) => new Promise((resolve, _reject) => {
          if (appBuild?.watchCmd) {
            const watcher = new ChildWatchCommand(appBuild.id, appBuild.watchCmd)
            watcher.start(appBuild).then(() => {
              resolve([appBuild.id, build, 'ok'])
            }).catch(error => {
              reject([appBuild.id, build, error])
            }).finally(() => {
              if (result?.stop !== undefined)
                result.stop()
            })
          } else {
            console.log(`[${green('+')}] (${bold(appBuild.id)}) no watch command`)
            resolve([appBuild.id, build, result])
          }
        }))
        .catch((error: BuildFailure) => {
          reject([appBuild.id, build, error])
        })
      return appBuild.run()
      .then((result: BuildResult) =>
        [appBuild.id, build, result])
      .catch((error: BuildFailure) => {
        const errorMessages = error?.errors.map(error => (error !== undefined && (error?.text || ''))).join(' ,')
        console.log(`[${red('!')}] (${bold(appBuild.id)}) build failed: ${errorMessages}`)
        reject([appBuild.id, build, error])
      })
    })

    Promise.allSettled(buildList).then(resultList => {
      const buildHandlerList: GolemBuildJob[] = resultList.map((buildResult: {status: string, value?: any}): GolemBuildJob => {
        const [key, build] = buildResult?.value || ['unknown', undefined]
        if (buildResult?.value === undefined) {
          return {
            id: key,
            build,
          }
        }

        console.log(`[${green('+')}] (${bold(key)}) ${watch ? 'watching' : 'built'}`)

        return {
          id: key,
          build,
        }        // console.dir(buildResult)
      })
      resolve(buildHandlerList)
    })
  })
