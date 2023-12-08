<script lang="ts">
  import FileClass from './components/Fileclass.svelte';
  import Compromisation from './components/Compromisation.svelte';
  import WifiLogo from './assets/no-wifi.png';

  let pingFailed = false;
  setInterval(async () => {
    await window.api.ping('ping');
    const response = await window.api.checkPing('checkPing');
    if (response.code != 200) {
      pingFailed = true;
    } else {
      pingFailed = false;
    }
  }, 5000);
</script>

{#if pingFailed}
  <div class="grid h-screen">
    <div class="place-self-center">
      <img src={WifiLogo} alt="no internet" class="m-auto h-40" />
      Internet connection lost. Please check your internet connection.
    </div>
  </div>
{:else if !pingFailed}
  <div>
    <FileClass />
  </div>
  <div>
  <Compromisation />
  </div>
{/if}
