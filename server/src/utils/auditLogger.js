import AuditLog from '../models/AuditLog.js';

export const logAuditEvent = async ({
  action,
  performedBy,
  targetEntity,
  entityId = '',
  details = {},
  req = null
}) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') : '';
    const userAgent = req ? req.headers['user-agent'] || '' : '';

    await AuditLog.create({
      action,
      performedBy,
      targetEntity,
      entityId: entityId ? entityId.toString() : '',
      details,
      ipAddress,
      userAgent
    });
  } catch (error) {
    console.error('[Audit Log Error]:', error.message);
  }
};

