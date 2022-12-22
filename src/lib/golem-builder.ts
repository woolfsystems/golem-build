import {green, bold} from 'cli-color'
import {readFile} from 'node:fs/promises'
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
export const watchProject = (projectDef: GolemProjectDefinition): Promise<GolemBuildJob[]> =>
  new Promise((resolve, _reject) => {
    const project = new GolemProject(projectDef)
    const buildList = project.builds.map(element =>
      project.watchBuild(element))

    Promise.allSettled(buildList).then(resultList => {
      const buildHandlerList: GolemBuildJob[] = resultList.map((buildResult: {status: string, value?: any}): GolemBuildJob => {
        const [key, build] = buildResult?.value || ['unknown', undefined]
        if (buildResult?.value === undefined) {
          return {
            id: key,
            build,
          }
        }

        console.log(`[${green('+')}] (${bold(key)}) watching`)

        return {
          id: key,
          build,
        }        // console.dir(buildResult)
      })
      resolve(buildHandlerList)
    })
  })

// const startTime = process.hrtime()
export const buildProject = (projectDef: GolemProjectDefinition): Promise<GolemBuildJob[]> =>
  new Promise((resolve, _reject) => {
    const project = new GolemProject(projectDef)
    const buildList = project.builds.map(element =>
      project.runBuild(element))

    Promise.allSettled(buildList).then(resultList => {
      const buildHandlerList: GolemBuildJob[] = resultList.map((buildResult: {status: string, value?: any}): GolemBuildJob => {
        const [key, build] = buildResult?.value || ['unknown', undefined]
        if (buildResult?.value === undefined) {
          return {
            id: key,
            build,
          }
        }

        console.log(`[${green('+')}] (${bold(key)}) built`)

        return {
          id: key,
          build,
        }        // console.dir(buildResult)
      })
      resolve(buildHandlerList)
    })
  })
