<script lang="ts">
  import type { Theme } from '@aws-amplify/ui-react';
  import type {
    CFCallableGetAuthTokenRequest,
    CFCallableGetAuthTokenResponse,
  } from '@armadillo/shared';

  import '@aws-amplify/ui-react/styles.css';

  import { AWS_REKOGNITION_REGION } from '@armadillo/shared';

  import { onMount } from 'svelte';
  import { used } from 'svelte-preprocess-react';

  import { Amplify } from 'aws-amplify';
  import { ThemeProvider } from '@aws-amplify/ui-react';
  import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness';
  import { default as amplifyConfig } from '../aws-exports';

  import { getHttpsCallable } from '../../../main/firebase/functions';
  import { signInServerToken } from '../../../main/firebase/auth';
  import { appStore } from '../lib/stores';

  // noop
  used(ThemeProvider);
  used(FaceLivenessDetector);

  export let region = AWS_REKOGNITION_REGION;
  export let clientId: string | null = null;

  const theme: Theme = {
    name: 'Face Liveness Theme',
    // Configure theme settings here
  };

  const getAuthToken = getHttpsCallable<
    CFCallableGetAuthTokenRequest,
    CFCallableGetAuthTokenResponse
  >('https_onCall_rekognition_getAuthToken');

  let sessionId = '';

  onMount(async () => {
    sessionId = await window.api.getFaceLivenessSessionId();
    if (!clientId) throw new Error('Client ID not specified');

    Amplify.configure(amplifyConfig);
  });

  const onAnalysisComplete = async () => {
    try {
      const response = await getAuthToken({ origin: 'wrapper', clientId, sessionId });
      // TODO: Proper response handling and logging in
      console.log(response);
      const authToken = response.data.token;
      signInServerToken(authToken, (error) => {
        if (!error) return;
        appStore.update((state) => ({
          ...state,
          currentState: 'fileClass',
        }));
        console.error(error);
      });
    } catch (error) {
      appStore.update((state) => ({
        ...state,
        passedCheck: false,
        errorMsg: 'Could not authenticate face',
      }));
    }

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
