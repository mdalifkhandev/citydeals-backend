export default () => ({
  app: {
    port: Number(process.env.PORT ?? 3000),
    publicBaseUrl: process.env.PUBLIC_BASE_URL ?? 'https://app.domain.com',
  },
});
