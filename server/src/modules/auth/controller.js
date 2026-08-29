import { authService } from './service.js';
import { env } from '../../config/env.js';

export const signupMember = async (req, res, next) => {
  try {
    const user = await authService.signupMember(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const signupCoordinator = async (req, res, next) => {
  try {
    const user = await authService.signupCoordinator(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    res.cookie('refreshToken', refreshToken, {
      path: '/api/v1/auth/refresh',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({ success: true, data: { user, accessToken } });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    const { accessToken, refreshToken: newRefreshToken, user } = await authService.refreshToken(token);

    res.cookie('refreshToken', newRefreshToken, {
      path: '/api/v1/auth/refresh',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ success: true, data: { accessToken, user } });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);
    res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const reEnrollFace = async (req, res, next) => {
  try {
    const { photos } = req.body;
    await authService.reEnrollFace(req.user.id, photos);
    res.status(200).json({ success: true, message: 'Face re-enrolled successfully' });
  } catch (error) {
    next(error);
  }
};
