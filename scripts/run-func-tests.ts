/**
 * Starts Playwright E2E after ensuring MongoDB is reachable on localhost:27017.
 * Skips `docker compose` when something already accepts TCP on 127.0.0.1:27017.
 * Otherwise runs `docker compose -f docker-compose.e2e.yml` with fallbacks for older CLI.
 * Set E2E_SKIP_DOCKER_MONGO=1 to never run compose (Mongo or Atlas elsewhere).
 */

import { execSync, spawnSync } from 'node:child_process'
import net from 'node:net'
import path from 'node:path'

const root = path.resolve(__dirname, '..')

const execShell =
  process.platform === 'win32' ? (process.env.ComSpec ?? 'cmd.exe') : '/bin/sh'

const skipDocker =
  process.env.E2E_SKIP_DOCKER_MONGO === 'true' ||
  process.env.E2E_SKIP_DOCKER_MONGO === '1'

const mongoReachable = (
  host: string,
  port: number,
  timeoutMs: number
): Promise<boolean> =>
  new Promise((resolve) => {
    const socket = net.createConnection({ host, port })
    const done = (ok: boolean) => {
      socket.removeAllListeners()
      socket.destroy()
      resolve(ok)
    }
    socket.setTimeout(timeoutMs)
    socket.once('connect', () => done(true))
    socket.once('timeout', () => done(false))
    socket.once('error', () => done(false))
  })

const pollMongoReady = async (totalMs: number) => {
  const deadline = Date.now() + totalMs
  while (Date.now() < deadline) {
    if (await mongoReachable('127.0.0.1', 27017, 800)) return
    await new Promise((r) => setTimeout(r, 400))
  }
  throw new Error(
    'MongoDB did not accept TCP connections on 127.0.0.1:27017 in time'
  )
}

const startMongoDocker = async () => {
  const run = (cmd: string) => {
    execSync(cmd, { cwd: root, stdio: 'inherit', shell: execShell })
  }

  const tryCompose = (binary: string, useWait: boolean) => {
    const w = useWait ? ' --wait' : ''
    run(`${binary} -f docker-compose.e2e.yml up -d${w}`)
  }

  try {
    tryCompose('docker compose', true)
    return
  } catch {
    /* older or different install */
  }
  try {
    tryCompose('docker-compose', true)
    return
  } catch {
    /* v1 may lack --wait */
  }
  try {
    tryCompose('docker compose', false)
  } catch {
    try {
      tryCompose('docker-compose', false)
    } catch {
      console.error(
        '[e2e] Could not run docker compose for mongo (docker-compose.e2e.yml). See docs/TESTING.md.'
      )
      process.exit(1)
    }
  }
  try {
    await pollMongoReady(60_000)
  } catch {
    console.error(
      '[e2e] Mongo did not become reachable on 127.0.0.1:27017. Check port mapping, firewall, or set E2E_SKIP_DOCKER_MONGO=1 if Mongo runs elsewhere.'
    )
    process.exit(1)
  }
}

const playwrightCli = path.join(
  root,
  'node_modules',
  '@playwright',
  'test',
  'cli.js'
)

const main = async () => {
  if (!skipDocker) {
    if (await mongoReachable('127.0.0.1', 27017, 1200)) {
      console.log(
        '[e2e] MongoDB already reachable on 127.0.0.1:27017 — skipping docker compose'
      )
    } else {
      await startMongoDocker()
    }
  }

  const scriptIdx = process.argv.findIndex((arg) =>
    arg.replaceAll('\\', '/').endsWith('scripts/run-func-tests.ts')
  )
  const pwArgs = (
    scriptIdx >= 0 ? process.argv.slice(scriptIdx + 1) : []
  ).filter((a) => a !== '--')

  const r = spawnSync(process.execPath, [playwrightCli, 'test', ...pwArgs], {
    cwd: root,
    stdio: 'inherit',
    env: process.env
  })

  process.exit(r.status === null || r.signal ? 1 : r.status)
}

void main().catch((err) => {
  console.error(err)
  process.exit(1)
})
