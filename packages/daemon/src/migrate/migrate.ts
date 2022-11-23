import { binFor } from '@pockethost/releases'
import { InstanceStatus } from '@pockethost/schema'
import { renameSync } from 'fs'
import { resolve } from 'path'
import {
  DAEMON_PB_BIN_DIR,
  DAEMON_PB_DATA_DIR,
  PUBLIC_PB_SUBDOMAIN,
} from '../constants'
import { backupInstance } from '../util/backupInstance'
import { dbg, error, info } from '../util/logger'
import { safeCatch } from '../util/promiseHelper'
import { pexec } from './pexec'
import { schema } from './schema'
import { withInstance } from './withInstance'

const PB_BIN = resolve(DAEMON_PB_BIN_DIR, binFor('lollipop'))

safeCatch(`root`, async () => {
  await backupInstance(
    PUBLIC_PB_SUBDOMAIN,
    `${+new Date()}`,
    async (progress) => {
      dbg(progress)
    }
  )

  info(`Upgrading`)
  await pexec(`${PB_BIN} upgrade --dir=pb_data`)

  await withInstance(async (client) => {
    await client.applySchema(schema)

    await client.updateInstances((instance) => {
      const src = resolve(DAEMON_PB_DATA_DIR, instance.subdomain)
      const dst = resolve(DAEMON_PB_DATA_DIR, instance.id)
      try {
        renameSync(src, dst)
      } catch (e) {
        error(`${e}`)
      }
      return {
        status: InstanceStatus.Idle,
        platform: instance.platform || 'ermine',
        version: instance.version || 'latest',
      }
    })
  })
})()
