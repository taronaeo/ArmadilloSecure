declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REKOGNITION_ACCESS_KEY_ID: string | undefined;
      REKOGNITION_ACCESS_KEY_SECRET: string | undefined;
    }
  }
}

export {};
