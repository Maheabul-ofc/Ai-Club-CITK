import * as userService from './service.js';

export const createTeamMember = async (req, res, next) => {
  try {
    const user = await userService.createTeamMember(req.body, req.user.id);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateTeamMember = async (req, res, next) => {
  try {
    const user = await userService.updateTeamMember(req.params.id, req.body, req.user.id);
    res.status(200).json({ success: true, data: user, message: 'Member updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteTeamMember = async (req, res, next) => {
  try {
    await userService.deleteTeamMember(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const createAdmin = async (req, res, next) => {
  try {
    const admin = await userService.createAdmin(req.body, req.user.id);
    res.status(201).json({ success: true, data: admin });
  } catch (error) {
    next(error);
  }
};

export const deleteAdmin = async (req, res, next) => {
  try {
    await userService.deleteAdmin(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateProfile(req.user.id, req.body);
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers(req.query);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};
