require('dotenv').config();

function buildRedisUrl() {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!restUrl || !token) return null;
  // Extract host from url (remove https://)
  const host = restUrl.replace('https://', '').replace(/\/$/, '');
  return `rediss://default:${token}@${host}:6379`;
}

// Two independent HMAC secrets for access and refresh tokens. Falling back to
// a single secret makes both tokens forgeable from one another.
const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: accessSecret,
    refreshSecret,
    // Access tokens are short (15m); refresh tokens are long (7d). They are
    // configured independently so operators can tune them separately.
    accessExpiry: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  csrfSecret: process.env.CSRF_SECRET,
  apiKey: process.env.API_KEY,
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  redisUrl: buildRedisUrl(),
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  fast2sms: {
    apiKey: process.env.FAST2SMS_API_KEY,
  },
  ai: {
    fastapiUrl: process.env.FASTAPI_URL,
    timeout: parseInt(process.env.AI_TIMEOUT, 10) || 25000,
    groqKey: process.env.GROQ_API_KEY,
    openaiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    geminiKey: process.env.GEMINI_API_KEY,
    deepseekKey: process.env.DEEPSEEK_API_KEY,
    deepseekBaseUrl: process.env.DEEPSEEK_BASE_URL,
    huggingfaceKey:
      process.env.HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_TOKEN,
    huggingfaceModel:
      process.env.HUGGINGFACE_MODEL || 'meta-llama/Meta-Llama-3-8B-Instruct',
    anthropicKey: process.env.ANTHROPIC_API_KEY,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'quintern',
    secure: process.env.CLOUDINARY_SECURE !== 'false',
  },
  uptoskills: {
    baseUrl: process.env.UPTOSKILLS_BASE_URL || '',
    apiKey: process.env.UPTOSKILLS_API_KEY || '',
  },
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    apiKey: process.env.EMAIL_API_KEY,
    from: process.env.EMAIL_FROM || 'noreply@internops.com',
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    retryMax: parseInt(process.env.EMAIL_RETRY_MAX, 10) || 3,
    rateLimitPerRecipient: parseInt(process.env.EMAIL_RATE_LIMIT, 10) || 5,
    rateLimitWindowMs: parseInt(process.env.EMAIL_RATE_WINDOW, 10) || 60000,
    bounceCheckEnabled: process.env.EMAIL_BOUNCE_CHECK === 'true',
  },
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
  rateLimit: {
    global: parseInt(process.env.RATE_LIMIT_GLOBAL, 10) || 1000,
    auth: parseInt(process.env.RATE_LIMIT_AUTH, 10) || 10,
  },
  socket: {
    path: process.env.SOCKET_PATH || '/socket.io',
    cors:
      process.env.SOCKET_CORS ||
      process.env.CORS_ORIGIN ||
      'http://localhost:5173',
  },
};
