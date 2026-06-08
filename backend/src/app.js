require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const xss = require('xss');

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
        styleSrc:   ["'self'", "'unsafe-inline'"],
        imgSrc:     ["'self'", 'data:', 'blob:'],
        scriptSrc:  ["'self'"],
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

// ─── NoSQL Injection Prevention ───────────────────────────────────────────────
// Strips keys containing '$' or '.' from req.body and req.params only
// (avoids touching read-only req.query getter on newer Express/Router versions)
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key]);
    }
  }
};

app.use((req, _res, next) => {
  sanitizeObject(req.body);
  sanitizeObject(req.params);
  next();
});

// ─── XSS Prevention (sanitize string values in body) ─────────────────────────
const sanitizeStrings = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      obj[key] = xss(obj[key]);
    } else if (typeof obj[key] === 'object') {
      sanitizeStrings(obj[key]);
    }
  }
};

app.use((req, _res, next) => {
  sanitizeStrings(req.body);
  next();
});

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
