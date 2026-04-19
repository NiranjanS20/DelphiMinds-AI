const dotenv = require('dotenv');

dotenv.config();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const splitCsv = (value) =>
  String(value || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: toNumber(process.env.PORT, 5000),

  DATABASE_URL: process.env.DATABASE_URL || '',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: toNumber(process.env.DB_PORT, 5432),
  DB_NAME: process.env.DB_NAME || 'delphiminds',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',

  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '',
  FIREBASE_SERVICE_ACCOUNT_PATH: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '',

  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:8000',

  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
  GROQ_API_URL:
    process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions',

  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  GEMINI_API_URL:
    process.env.GEMINI_API_URL ||
    'https://generativelanguage.googleapis.com/v1beta',

  GEMINI_LEARNING_API_KEY: process.env.GEMINI_LEARNING_API_KEY || '',

  ADZUNA_BASE_URL:
    process.env.ADZUNA_BASE_URL ||
    process.env.JOB_API_BASE_URL ||
    'https://api.adzuna.com/v1/api',
  ADZUNA_APP_ID: process.env.ADZUNA_APP_ID || '',
  ADZUNA_APP_KEY: process.env.ADZUNA_APP_KEY || process.env.JOB_API_KEY || '',
  ADZUNA_DEFAULT_COUNTRY: String(process.env.ADZUNA_DEFAULT_COUNTRY || 'in').toLowerCase(),
  ADZUNA_SUPPORTED_COUNTRIES: splitCsv(
    process.env.ADZUNA_SUPPORTED_COUNTRIES || 'in,us,gb,ca,au'
  ),

  JOB_API_BASE_URL:
    process.env.JOB_API_BASE_URL ||
    process.env.ADZUNA_BASE_URL ||
    'https://api.adzuna.com/v1/api',
  JOB_API_KEY: process.env.JOB_API_KEY || process.env.ADZUNA_APP_KEY || '',

  ALLOWED_ORIGINS: splitCsv(process.env.ALLOWED_ORIGINS || 'http://localhost:5173'),
  MAX_UPLOAD_SIZE_MB: toNumber(process.env.MAX_UPLOAD_SIZE_MB, 10),
  UPLOAD_ROOT: process.env.UPLOAD_ROOT || 'uploads',
  ALLOW_MOCK_AUTH: String(process.env.ALLOW_MOCK_AUTH || 'false').toLowerCase() === 'true',
};

module.exports = {
  ...config,

  nodeEnv: config.NODE_ENV,
  port: config.PORT,

  databaseUrl: config.DATABASE_URL,
  dbHost: config.DB_HOST,
  dbPort: config.DB_PORT,
  dbName: config.DB_NAME,
  dbUser: config.DB_USER,
  dbPassword: config.DB_PASSWORD,

  firebaseProjectId: config.FIREBASE_PROJECT_ID,
  firebaseServiceAccountJson: config.FIREBASE_SERVICE_ACCOUNT_JSON,
  firebaseServiceAccountPath: config.FIREBASE_SERVICE_ACCOUNT_PATH,

  mlServiceUrl: config.ML_SERVICE_URL,

  groqApiKey: config.GROQ_API_KEY,
  groqModel: config.GROQ_MODEL,
  groqApiUrl: config.GROQ_API_URL,

  geminiApiKey: config.GEMINI_API_KEY,
  geminiModel: config.GEMINI_MODEL,
  geminiApiUrl: config.GEMINI_API_URL,

  geminiLearningApiKey: config.GEMINI_LEARNING_API_KEY,

  adzunaBaseUrl: config.ADZUNA_BASE_URL,
  adzunaAppId: config.ADZUNA_APP_ID,
  adzunaAppKey: config.ADZUNA_APP_KEY,
  adzunaDefaultCountry: config.ADZUNA_DEFAULT_COUNTRY,
  adzunaSupportedCountries: config.ADZUNA_SUPPORTED_COUNTRIES,

  jobApiBaseUrl: config.JOB_API_BASE_URL,
  jobApiKey: config.JOB_API_KEY,

  allowedOrigins: config.ALLOWED_ORIGINS,
  maxUploadSizeMb: config.MAX_UPLOAD_SIZE_MB,
  uploadRoot: config.UPLOAD_ROOT,
  allowMockAuth: config.ALLOW_MOCK_AUTH,
};
