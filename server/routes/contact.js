/**
 * @file server/routes/contact.js
 * @description Express router for contact inquiries.
 */

import { Router } from 'express';
import validate from '../middleware/validate.js';
import { contactMessageSchema } from '../validators/contactValidators.js';
import contactService from '../services/contactService.js';

const router = Router();

// POST /api/v1/contact
router.post('/', validate({ body: contactMessageSchema }), (req, res, next) => {
  try {
    const saved = contactService.submitMessage(req.body);
    res.status(201).json({
      data: {
        id: saved.id,
        message: 'Thank you for reaching out. Your message has been received.'
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
