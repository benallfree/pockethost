import { clientService } from '$services'
import {
  assertTruthy,
  logger,
  mkSingleton,
  RpcCommands,
  RpcFields,
  RpcStatus,
  RPC_COMMANDS,
} from '@pockethost/common'
import { isObject } from '@s-libs/micro-dash'
import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv'
import Bottleneck from 'bottleneck'
import { default as knexFactory } from 'knex'
import pocketbaseEs from 'pocketbase'
import { AsyncReturnType, JsonObject } from 'type-fest'

export type RpcServiceApi = AsyncReturnType<typeof rpcService>

export type KnexApi = ReturnType<typeof knexFactory>
export type CommandModuleInitializer = (
  register: RpcServiceApi['registerCommand'],
  client: pocketbaseEs,
  knex: KnexApi
) => void

export type RpcRunner<
  TPayload extends JsonObject,
  TResult extends JsonObject
> = (job: RpcFields<TPayload, TResult>) => Promise<TResult>

export type RpcServiceConfig = {}

export const rpcService = mkSingleton(async (config: RpcServiceConfig) => {
  const { dbg, error } = logger().create('RpcService')
  const { client } = await clientService()

  const limiter = new Bottleneck({ maxConcurrent: 1 })

  const jobHandlers: {
    [_ in RpcCommands]?: {
      validate: ValidateFunction<any>
      run: RpcRunner<any, any>
    }
  } = {}

  const run = async (rpc: RpcFields<any, any>) => {
    await client.setRpcStatus(rpc, RpcStatus.Queued)
    return limiter.schedule(async () => {
      try {
        dbg(`Starting job ${rpc.id} (${rpc.cmd})`, JSON.stringify(rpc))
        await client.setRpcStatus(rpc, RpcStatus.Starting)
        const cmd = (() => {
          const { cmd } = rpc
          if (!RPC_COMMANDS.find((c) => c === cmd)) {
            throw new Error(
              `RPC command '${cmd}' is invalid. It must be one of: ${RPC_COMMANDS.join(
                '|'
              )}.`
            )
          }
          return cmd as RpcCommands
        })()

        const handler = jobHandlers[cmd]
        if (!handler) {
          throw new Error(`RPC handler ${cmd} is not registered`)
        }

        const { payload } = rpc
        assertTruthy(isObject(payload), `Payload must be an object`)

        const { validate, run } = handler
        if (!validate(payload)) {
          throw new Error(
            `Payload for ${cmd} fails validation: ${JSON.stringify(payload)}`
          )
        }
        dbg(`Running RPC ${rpc.id}`, rpc)
        await client.setRpcStatus(rpc, RpcStatus.Running)
        const res = await run(rpc)
        await client.setRpcStatus(rpc, RpcStatus.FinishedSuccess, res)
      } catch (e) {
        if (!(e instanceof Error)) {
          throw new Error(`Expected Error here but got ${typeof e}:${e}`)
        }
        dbg(`RPC failed with`, e)
        await client.rejectRpc(rpc, e).catch((e) => {
          error(`rpc ${rpc.id} failed to reject with ${e}`)
        })
      }
    })
  }

  const unsub = await client.onNewRpc(run)
  await client.resetRpcs()
  await client.resetBackups()
  const rpcs = await client.incompleteRpcs()
  rpcs.forEach(run)

  const shutdown = () => {
    unsub()
  }

  const ajv = new Ajv()

  const registerCommand = <
    TPayload extends JsonObject,
    TResult extends JsonObject
  >(
    commandName: RpcCommands,
    schema: JSONSchemaType<TPayload>,
    runner: RpcRunner<TPayload, TResult>
  ) => {
    if (jobHandlers[commandName]) {
      throw new Error(`${commandName} job handler already registered.`)
    }
    jobHandlers[commandName] = {
      validate: ajv.compile(schema),
      run: runner,
    }
  }

  return {
    registerCommand,
    shutdown,
  }
})
