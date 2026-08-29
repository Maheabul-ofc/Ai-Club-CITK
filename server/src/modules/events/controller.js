import * as eventService from './service.js';

export const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const events = await eventService.getEvents(req.query);
    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicEvents = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 3;
    const events = await eventService.getPublicEvents(limit);
    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

export const updateEventStatus = async (req, res, next) => {
  try {
    const event = await eventService.updateEventStatus(req.params.id, req.body.status);
    res.status(200).json({
      success: true,
      data: event,
      message: 'Event status updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: event,
      message: 'Event updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const markAttendance = async (req, res, next) => {
  try {
    const attendance = await eventService.markAttendance(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: attendance,
      message: 'Attendance marked successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendance = async (req, res, next) => {
  try {
    const attendance = await eventService.getAttendance(req.params.id);
    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

export const exportAttendanceCSV = async (req, res, next) => {
  try {
    const csvData = await eventService.exportAttendanceCSV(req.params.id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendance-${req.params.id}.csv"`);
    res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};

export const getMyAttendance = async (req, res, next) => {
  try {
    const attendance = await eventService.getMyAttendance(req.user.id);
    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};
