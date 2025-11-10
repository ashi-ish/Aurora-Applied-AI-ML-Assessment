interface Config {
  api: { baseUrl: string; timeout: number };
}

function loadConfig(): Config {
  const baseUrl = process.env.EXTERNAL_API_BASE_URL;
  const timeout = process.env.EXTERNAL_API_TIMEOUT;

  if (!baseUrl) {
    throw new Error(
      "EXTERNAL_API_BASE_URL is not defined in environment variables"
    );
  }

  return {
    api: {
      baseUrl,
      timeout: timeout ? parseInt(timeout, 10) : 5000,
    },
  };
}

export const config = loadConfig();
