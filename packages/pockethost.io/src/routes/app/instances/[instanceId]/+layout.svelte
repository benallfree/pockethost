<script lang="ts">
  import { page } from '$app/stores'
  import AuthStateGuard from '$components/helpers/AuthStateGuard.svelte'
  import { client } from '$src/pocketbase'
  import { dbg } from '$util/logger'
  import { assertExists, createCleanupManager } from '@pockethost/common'
  import { onDestroy, onMount } from 'svelte'
  import { instance } from './store'

  const { instanceId } = $page.params

  const cm = createCleanupManager()
  instance.set(undefined)
  onMount(async () => {
    const { watchInstanceById } = client()
    watchInstanceById(instanceId, (r) => {
      dbg(`Handling instance update`, r)
      const { action, record } = r
      assertExists(record, `Expected instance here`)
      instance.set(record)
    }).then(cm.add)
  })
  cm.add(() => {
    instance.set(undefined)
  })
  onDestroy(() => cm.shutdown())
</script>

<AuthStateGuard>
  <div class="container">
    {#if $instance}
      <h2>{$instance.subdomain}</h2>
      <slot />
      <div class="text-center py-5">
        <a href="/dashboard" class="btn btn-light"
          ><i class="bi bi-arrow-left-short" /> Back to Dashboard</a
        >
      </div>
    {/if}
  </div>
</AuthStateGuard>
