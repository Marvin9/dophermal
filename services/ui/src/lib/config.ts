export default {
  DOPHERMAL_API: `${new URL(import.meta.env.DOPHERMAL_API_HOST).origin}/api`,
  ENV: 'development',
  bearerTokenKey: 'token',
};
