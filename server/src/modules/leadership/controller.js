import * as service from './service.js';

/**
 * Get all leadership profiles
 */
export const getAll = async (req, res, next) => {
  try {
    const profiles = await service.getAllProfiles();
    res.status(200).json({ success: true, data: profiles });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new leadership profile
 */
export const create = async (req, res, next) => {
  try {
    const profile = await service.createProfile(req.body);
    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a leadership profile
 */
export const update = async (req, res, next) => {
  try {
    const profile = await service.updateProfile(req.params.id, req.body);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a leadership profile
 */
export const deleteLeadership = async (req, res, next) => {
  try {
    await service.deleteProfile(req.params.id);
    res.status(200).json({ success: true, message: 'Profile deleted successfully' });
  } catch (error) {
    next(error);
  }
};
