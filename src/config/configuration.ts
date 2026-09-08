/**
 * 集中读取环境变量并给出默认值，业务代码统一通过 ConfigService 获取，
 * 避免在代码里散落 process.env。结构上按领域分组（database/jwt/upload/invite）。
 */
export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'daily_plan',
    synchronize: (process.env.DB_SYNCHRONIZE ?? 'true') === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  upload: {
    dir: process.env.UPLOAD_DIR ?? 'uploads',
    maxSizeMb: parseInt(process.env.UPLOAD_MAX_SIZE_MB ?? '10', 10),
  },
  invite: {
    baseUrl: process.env.INVITE_BASE_URL ?? 'http://localhost:3000/invite',
  },
});
