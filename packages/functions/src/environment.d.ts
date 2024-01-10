declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FUNCTIONS_EMULATOR: 'true' | 'false';
      REKOGNITION_ACCESS_KEY_ID: string | undefined;
      REKOGNITION_ACCESS_KEY_SECRET: string | undefined;
    }
  }
}

export {};
