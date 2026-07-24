import 'dotenv/config';

const requiredEnvVars = [
  'PORT',
  'NODE_ENV',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'REFRESH_TOKEN_SECRET',
  'REFRESH_TOKEN_EXPIRES_IN'
];

const validateEnv = () => {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

validateEnv();

export const config = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: process.env.RATE_LIMIT_MAX
};
