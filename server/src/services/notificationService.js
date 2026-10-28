import Notification from '../models/Notification.js';

export const createNotification = async ({
  recipient,
  sender = null,
  title,
  message,
  link = '',
  type = 'system'
}) => {
  try {
    return await Notification.create({
      recipient,
      sender,
      title,
      message,
      link,
      type
    });
  } catch (error) {
    console.error('[Notification Service Error]:', error.message);
  }
};

