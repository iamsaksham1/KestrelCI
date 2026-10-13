/**
 * @file server/services/contactService.js
 * @description Contact inquiry submission service.
 */

import crypto from 'crypto';
import contactRepo from '../database/repositories/contactRepo.js';

export const contactService = {
  submitMessage(data) {
    const id = `msg_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
    return contactRepo.create({
      id,
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message
    });
  }
};

export default contactService;
