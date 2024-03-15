let host = '';

try {
  if (import.meta.env.VITE_DOPHERMAL_API_HOST) {
    host = new URL(import.meta.env.VITE_DOPHERMAL_API_HOST).origin;
  }
} catch (e) {
  console.log({host});
}

export default {
  DOPHERMAL_API: `${host}/api`,
  ENV: 'development',
  bearerTokenKey: 'token',
};
