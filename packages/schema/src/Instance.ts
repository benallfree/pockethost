import { PlatformId, VersionId } from '@pockethost/releases'
import { BaseFields, RecordId, Seconds, Subdomain, UserId } from './types'

export enum InstanceStatus {
  Unknown = '',
  Idle = 'idle',
  Port = 'porting',
  Starting = 'starting',
  Running = 'running',
  Failed = 'failed',
}

export type InstanceSecretKey = string
export type InstanceSecretValue = string
export type InstanceSecretCollection = {
  [name: InstanceSecretKey]: InstanceSecretValue
}

export type InstanceFields = BaseFields & {
  subdomain: Subdomain
  uid: UserId
  status: InstanceStatus
  platform: PlatformId
  version: VersionId
  secondsThisMonth: Seconds
  isBackupAllowed: boolean
  currentWorkerBundleId: RecordId
  secrets: InstanceSecretCollection | null
}

export type InstanceFields_Create = Omit<InstanceFields, keyof BaseFields>

export type InstanceRecordsById = { [_: RecordId]: InstanceFields }
