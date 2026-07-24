import { authConfig } from './auth.config.js';

export const setAccessTokenCookie = (res, token) => {
  res.cookie('accessToken', token, {
    httpOnly: authConfig.cookie.httpOnly,
    secure: authConfig.cookie.secure,
    sameSite: authConfig.cookie.sameSite,
    maxAge: 15 * 60 * 1000,
    path: authConfig.cookie.path,
    domain: authConfig.cookie.domain
  });
};

export const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: authConfig.cookie.httpOnly,
    secure: authConfig.cookie.secure,
    sameSite: authConfig.cookie.sameSite,
    maxAge: authConfig.cookie.maxAge,
    path: authConfig.cookie.path,
    domain: authConfig.cookie.domain
  });
};

export const clearAccessTokenCookie = (res) => {
  res.clearCookie('accessToken', {
    httpOnly: authConfig.cookie.httpOnly,
    secure: authConfig.cookie.secure,
    sameSite: authConfig.cookie.sameSite,
    path: authConfig.cookie.path,
    domain: authConfig.cookie.domain
  });
};

export const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: authConfig.cookie.httpOnly,
    secure: authConfig.cookie.secure,
    sameSite: authConfig.cookie.sameSite,
    path: authConfig.cookie.path,
    domain: authConfig.cookie.domain
  });
};

export const clearAuthCookies = (res) => {
  clearAccessTokenCookie(res);
  clearRefreshTokenCookie(res);
};

export const getCookieOptions = () => {
  return {
    httpOnly: authConfig.cookie.httpOnly,
    secure: authConfig.cookie.secure,
    sameSite: authConfig.cookie.sameSite,
    maxAge: authConfig.cookie.maxAge,
    path: authConfig.cookie.path,
    domain: authConfig.cookie.domain
  };
};
