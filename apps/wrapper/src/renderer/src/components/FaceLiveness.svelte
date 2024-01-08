<script lang="ts">
  import type { Theme } from '@aws-amplify/ui-react';
  import type {
    CFCallableFaceLivenessSessionRequest,
    CFCallableFaceLivenessSessionResponse,
  } from '@armadillo/shared';

  import '@aws-amplify/ui-react/styles.css';

  import { onMount } from 'svelte';
  import { used } from 'svelte-preprocess-react';

  import { Amplify } from 'aws-amplify';
  import { ThemeProvider } from '@aws-amplify/ui-react';
  import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness';
  import { default as amplifyConfig } from '../aws-exports';

  import { getHttpsCallable } from '../../../main/firebase/functions';

  // noop
  used(ThemeProvider);
  used(FaceLivenessDetector);

  export let region = 'ap-northeast-1';
  export let clientId: string | null = null;

  let sessionId = '';

  const theme: Theme = {
    name: 'Face Liveness Theme',
    // Configure theme settings here
  };

  const getFaceLivenessSessionId = getHttpsCallable<
    CFCallableFaceLivenessSessionRequest,
    CFCallableFaceLivenessSessionResponse
  >('onCall_getFaceLivenessSessionId');

  onMount(async () => {
    if (!clientId) throw new Error('Client ID not specified');

    Amplify.configure(amplifyConfig);

    try {
      sessionId = (await getFaceLivenessSessionId({ client_id: clientId })).data.sessionId;
    } catch (error) {
      console.error(error);
    }
  });

  const onAnalysisComplete = () => {
    console.log('Analysis Complete');
    console.log(`Session ID: ${sessionId}`);
  };

  const onError = (error) => {
    console.error(error);
  };

  $: console.log(sessionId);
</script>

{#if !sessionId}
  <p>Fetching session token...</p>
{:else}
  <react:ThemeProvider {theme}>
    <react:FaceLivenessDetector
      {region}
      {sessionId}
      {onAnalysisComplete}
      {onError}
      components={{
        // Disables photo sensitivity warning
        PhotosensitiveWarning: () => {},
      }} />
  </react:ThemeProvider>
{/if}
