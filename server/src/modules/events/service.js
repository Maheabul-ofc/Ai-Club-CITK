import prisma from '../../config/database.js';


export const createEvent = async (data, userId) => {
  const event = await prisma.event.create({
    data: {
      ...data,
      date: new Date(data.date),
      createdBy: userId,
    }
  });
  return event;
};

export const getEvents = async (filters = {}) => {
  const { status } = filters;
  const where = {};
  if (status) where.status = status;

  const events = await prisma.event.findMany({
    where,
    orderBy: { date: 'desc' },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      _count: {
        select: { attendances: true }
      }
    }
  });
  return events;
};

export const getPublicEvents = async (limit = 3) => {
  const events = await prisma.event.findMany({
    where: { status: 'SCHEDULED' },
    orderBy: { date: 'asc' },
    take: limit,
    select: {
      id: true,
      title: true,
      date: true,
      time: true,
      status: true,
      // intentionally omitting creator info for public view
    }
  });
  // Map 'id' to '_id' since LandingPage expects '_id' (from earlier Mongo-like code), or just return both for safety
  return events.map(e => ({ ...e, _id: e.id }));
};

export const getEventById = async (eventId) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });
  if (!event) {
    const error = new Error('Event not found');
    error.status = 404;
    throw error;
  }
  return event;
};

export const updateEventStatus = async (eventId, status) => {
  const event = await prisma.event.update({
    where: { id: eventId },
    data: { status }
  });
  return event;
};

export const updateEvent = async (eventId, data) => {
  const updateData = { ...data };
  if (data.date) {
    updateData.date = new Date(data.date);
  }
  const event = await prisma.event.update({
    where: { id: eventId },
    data: updateData
  });
  return event;
};

export const deleteEvent = async (eventId) => {
  // First delete related attendances to satisfy foreign key constraints
  await prisma.attendance.deleteMany({
    where: { eventId }
  });
  
  const event = await prisma.event.delete({
    where: { id: eventId }
  });
  return event;
};

export const markAttendance = async (eventId, data) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    const error = new Error('Event not found');
    error.status = 404;
    throw error;
  }
  if (event.status === 'COMPLETED') {
    const error = new Error('Cannot mark attendance for a completed event');
    error.status = 400;
    throw error;
  }

  const attendance = await prisma.attendance.upsert({
    where: {
      eventId_userId: {
        eventId,
        userId: data.userId
      }
    },
    update: {
      confidenceScore: data.confidenceScore ?? null,
      timestamp: new Date()
    },
    create: {
      eventId,
      userId: data.userId,
      confidenceScore: data.confidenceScore ?? null,
      markedManually: data.confidenceScore == null
    },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  });
  return attendance;
};


export const getAttendance = async (eventId) => {
  const attendances = await prisma.attendance.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          rollNumber: true,
          branch: true,
          semester: true,
        }
      }
    },
    orderBy: { timestamp: 'desc' }
  });
  return attendances;
};

export const exportAttendanceCSV = async (eventId) => {
  // Fetch event name
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { title: true }
  });
  const eventName = event?.title || 'Unknown Event';

  const attendances = await getAttendance(eventId);
  
  const headers = ['Event Name', 'Name', 'Roll No', 'Email', 'Branch', 'Semester', 'Timestamp'];
  
  const rows = attendances.map(record => [
    eventName,
    record.user.name,
    record.user.rollNumber || '',
    record.user.email,
    record.user.branch || '',
    record.user.semester || '',
    new Date(record.timestamp).toLocaleString()
  ]);

  const escapeCSV = (field) => {
    if (field === null || field === undefined) return '';
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Get attendance records for a specific user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} List of attendance records with event details
 */
export const getMyAttendance = async (userId) => {
  const attendances = await prisma.attendance.findMany({
    where: { userId },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          date: true,
          time: true,
          status: true
        }
      }
    },
    orderBy: { timestamp: 'desc' }
  });
  return attendances;
};
