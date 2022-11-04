import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { AsyncReturnType } from 'type-fest'
import { DAEMON_PB_BIN_DIR, DAEMON_PB_DATA_DIR } from '../constants'
import { mkInternalAddress, mkInternalUrl } from './internal'
import { tryFetch } from './tryFetch'
export type PocketbaseProcess = AsyncReturnType<typeof _spawn>

export const _spawn = async (cfg: {
  subdomain: string
  port: number
  bin: string
  onUnexpectedStop?: (code: number | null) => void
}) => {
  const { subdomain, port, bin, onUnexpectedStop } = cfg
  const cmd = `${DAEMON_PB_BIN_DIR}/${bin}`
  if (!existsSync(cmd)) {
    throw new Error(
      `PocketBase binary (${bin}) not found. Contact pockethost.io.`
    )
  }

  const args = [
    `serve`,
    `--dir`,
    `${DAEMON_PB_DATA_DIR}/${subdomain}/pb_data`,
    `--http`,
    mkInternalAddress(port),
  ]
  console.log(`Spawning ${subdomain}`, { cmd, args })
  const ls = spawn(cmd, args)

  ls.stdout.on('data', (data) => {
    console.log(`${subdomain} stdout: ${data}`)
  })

  ls.stderr.on('data', (data) => {
    console.error(`${subdomain} stderr: ${data}`)
  })

  ls.on('close', (code) => {
    console.log(`${subdomain} closed with code ${code}`)
  })
  ls.on('exit', (code) => {
    if (code) {
      ;(
        onUnexpectedStop ||
        ((code) => {
          console.log(`Exited with ${code}`)
        })
      )(code)
    }
  })
  ls.on('error', (err) => {
    console.log(`${subdomain} had error ${err}`)
  })

  await tryFetch(mkInternalUrl(port))
  return {
    pid: ls.pid,
    kill: () => ls.kill(),
  }
}
