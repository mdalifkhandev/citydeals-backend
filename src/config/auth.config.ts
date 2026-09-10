export default () => ({
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'dev-only-change-me',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-only-refresh-change-me',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },
});
