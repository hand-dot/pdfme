import { Template } from './types';
import { createHash } from 'crypto';

export interface SecurityOptions {
  enableEncryption?: boolean;
  password?: string;
  permissions?: {
    printing?: boolean;
    modifying?: boolean;
    copying?: boolean;
    annotating?: boolean;
  };
  watermark?: {
    text: string;
    opacity?: number;
  };
}

export function validateTemplate(template: Template): boolean {
  // Validate template structure and content
  if (!template || typeof template !== 'object') return false;
  if (!Array.isArray(template.schemas)) return false;
  
  // Add more validation rules as needed
  return true;
}

export function hashTemplate(template: Template): string {
  return createHash('sha256')
    .update(JSON.stringify(template))
    .digest('hex');
}

export function sanitizeInput(input: Record<string, any>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(input)) {
    // Convert to string and sanitize
    sanitized[key] = String(value)
      .replace(/[<>]/g, '') // Remove potential HTML/XML tags
      .trim();
  }
  
  return sanitized;
}

export function createAuditLog(action: string, template: Template, user?: string): void {
  const timestamp = new Date().toISOString();
  const templateHash = hashTemplate(template);
  
  console.log(JSON.stringify({
    timestamp,
    action,
    templateHash,
    user: user || 'anonymous',
    // Add more audit information as needed
  }));
}
