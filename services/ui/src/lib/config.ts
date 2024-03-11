export default {
  DOPHERMAL_API: `${new URL(import.meta.env.VITE_DOPHERMAL_API_HOST).origin}/api`,
  ENV: 'development',
  bearerTokenKey: 'token',
};
