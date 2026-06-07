require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cookie: {
    secret: process.env.COOKIE_SECRET,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760,
    path: process.env.UPLOAD_PATH || './uploads',
  },
};

// Validate required config
const required = ['mongoUri', 'jwt.accessSecret', 'jwt.refreshSecret'];
required.forEach((key) => {
  const val = key.split('.').reduce((o, k) => (o || {})[k], config);
  if (!val) {
    throw new Error(`Missing required config: ${key}`);
  }
});

module.exports = config;
