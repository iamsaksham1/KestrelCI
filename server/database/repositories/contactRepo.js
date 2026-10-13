/**
 * @file server/database/repositories/contactRepo.js
 * @description Repository for contact_messages table data access.
 * Stores inquiries submitted through the contact form.
 */

import { getDb } from '../connection.js';

export const contactRepo = {
  /**
   * Stores a validated contact message.
   */
  create(message, db = getDb()) {
    const stmt = db.prepare(`
      INSERT INTO contact_messages (
        id, name, email, subject, message, created_at
      ) VALUES (
        @id, @name, @email, @subject, @message, datetime('now')
      )
    `);

    stmt.run({
      id: message.id,
      name: message.name,
      email: message.email,
      subject: message.subject,
      message: message.message
    });

    return this.findById(message.id, db);
  },

  /**
   * Finds a message by ID.
   */
  findById(id, db = getDb()) {
    return db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(id);
  },

  /**
   * Retrieves paginated contact messages.
   */
  findAll({ limit = 50, offset = 0 } = {}, db = getDb()) {
    return db.prepare(`
      SELECT * FROM contact_messages 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).all(limit, offset);
  }
};

export default contactRepo;
