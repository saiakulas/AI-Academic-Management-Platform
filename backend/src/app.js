require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const config = require('./config');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const v1Routes = require('./routes/v1/index');
const logger = require('./utils/logger');

const app = express();

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        scriptSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.cookie.secret));

// ─── Security Sanitization ────────────────────────────────────────────────────
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss());           // Prevent XSS attacks

// ─── HTTP Logging ─────────────────────────────────────────────────────────────
if (config.env !== 'test') {
  app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.http(message.trim()),
      },
    })
  );
}

// ─── Trust Proxy (for production/reverse proxies) ────────────────────────────
if (config.env === 'production') {
  app.set('trust proxy', 1);
}

// ─── API Rate Limiting ────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Static Files (uploads) ───────────────────────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', v1Routes);

// ─── Root health check ────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    product: 'EduFlow',
    version: '1.0.0',
    docs: '/api/v1/health',
  });
});

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
