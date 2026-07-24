import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { authConfig } from './auth.config.js';

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, authConfig.jwt.secret, {
    expiresIn: authConfig.jwt.accessTokenExpiry,
    issuer: authConfig.jwt.issuer,
    audience: authConfig.jwt.audience,
    algorithm: authConfig.jwt.algorithm
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, authConfig.jwt.refreshTokenSecret, {
    expiresIn: authConfig.jwt.refreshTokenExpiry,
    issuer: authConfig.jwt.issuer,
    audience: authConfig.jwt.audience,
    algorithm: authConfig.jwt.algorithm,
    jwtid: nanoid()
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, authConfig.jwt.secret, {
    issuer: authConfig.jwt.issuer,
    audience: authConfig.jwt.audience,
    algorithms: [authConfig.jwt.algorithm]
  });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, authConfig.jwt.refreshTokenSecret, {
    issuer: authConfig.jwt.issuer,
    audience: authConfig.jwt.audience,
    algorithms: [authConfig.jwt.algorithm]
  });
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};

export const generateTokenFamily = () => {
  return nanoid(16);
};

export const generateSecureTokenId = () => {
  return nanoid(21);
};

export const hashRefreshToken = async (token) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(token, salt);
};

export const compareRefreshToken = async (token, hashedToken) => {
  return bcrypt.compare(token, hashedToken);
};

export const getTokenExpiration = (token) => {
  const decoded = decodeToken(token);
  return decoded ? decoded.exp * 1000 : null;
};

export const isTokenExpired = (token) => {
  const expiration = getTokenExpiration(token);
  return expiration ? Date.now() >= expiration : true;
};

export const getTokenRemainingTime = (token) => {
  const expiration = getTokenExpiration(token);
  return expiration ? Math.max(0, expiration - Date.now()) : 0;
};
