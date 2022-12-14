<script lang="ts">
  import AlertBar from '$components/AlertBar.svelte'
  import { client } from '$src/pocketbase'
  import {
    BackupStatus,
    createCleanupManager,
    type BackupFields,
    type InstanceFields,
    type RecordId
  } from '@pockethost/common'
  import { reduce, sortBy } from '@s-libs/micro-dash'
  import { formatDistanceToNow } from 'date-fns'
  import prettyBytes from 'pretty-bytes'
  import { onDestroy, onMount } from 'svelte'
  import { writable } from 'svelte/store'

  export let instance: InstanceFields

  const cm = createCleanupManager()
  const backups = writable<BackupFields[]>([])
  let isBackingUp = false
  onMount(async () => {
    const { watchBackupsByInstanceId } = client()
    watchBackupsByInstanceId(instance.id, (r) => {
      // dbg(`Handling backup update`, r)
      const { action, record } = r
      const _backups = reduce(
        $backups,
        (c, b) => {
          c[b.id] = b
          return c
        },
        {} as { [_: RecordId]: BackupFields }
      )
      _backups[record.id] = record

      isBackingUp = false
      backups.set(
        sortBy(_backups, (e) => {
          isBackingUp ||=
            e.status !== BackupStatus.FinishedError && e.status !== BackupStatus.FinishedSuccess
          return Date.parse(e.created)
        }).reverse()
      )
      // dbg(record.id)
    }).then(cm.add)
  })
  onDestroy(() => cm.shutdown())

  const startBackup = () => {
    const { createInstanceBackupJob } = client()
    createInstanceBackupJob({
      instanceId: instance.id
    })
  }
</script>

<div class="py-4">
  <h2>Backup</h2>

  {#if instance.isBackupAllowed}
    <div class="text-center py-5">
      <button class="btn btn-light" on:click={() => startBackup()} disabled={isBackingUp}>
        <i class="bi bi-safe" /> Backup Now
      </button>
    </div>

    <div>
      {#each $backups as { id, bytes, updated, version, status, message, progress }}
        <div>
          {#if status === BackupStatus.FinishedSuccess}
            <div class="text-success">
              {version} ({prettyBytes(bytes)}) - Finished {new Date(updated)}
            </div>
          {/if}
          {#if status === BackupStatus.FinishedError}
            <div class="text-danger">
              {version} - Finished {new Date(updated)}
              <AlertBar icon="bi bi-exclamation-triangle-fill" text={message} />
            </div>
          {/if}
          {#if status !== BackupStatus.FinishedError && status !== BackupStatus.FinishedSuccess}
            <div class="text-warning">
              {version}
              {status}
              {#each Object.entries(progress || {}) as [src, pct]}
                <div class="badge bg-secondary" style="margin-right: 3px">
                  {src}
                  <code>
                    {Math.ceil(pct * 100)}%
                  </code>
                </div>
              {/each}
              Started {formatDistanceToNow(Date.parse(updated))} ago
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
  {#if !instance.isBackupAllowed}
    You must access this instance at least once before backups can be made.
  {/if}
</div>

<style lang="scss">
  code {
    width: 30px;
    text-align: right;
    display: inline-block;
  }
</style>
