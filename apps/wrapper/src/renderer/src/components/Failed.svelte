<script lang="ts">
  import { appStore } from '../lib/stores';
  import close from '../assets/close.png';
</script>

<div class="grid h-screen">
  <div class="place-self-center">
    <img src={close} alt="x" class="mx-auto h-32" />
    <div class="text-center mt-12"> Verification failed. </div>
    <div class="text-center mt-12">{$appStore.errorMsg}</div>
  </div>
</div>
