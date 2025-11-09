import { getServerSession } from 'next-auth';
import { authOptions } from '../app/api/auth/[...nextauth]/route';

/**
 * Sanitize a key by removing quotes and trimming whitespace
 */
function cleanKey(value) {
  if (!value) return '';
  return value.replace(/^['"]+|['"]+$/g, '').trim();
}

/**
 * Check if a request is authorized for admin operations.
 * Authorization is granted if:
 * 1. User has an admin session (role === 'admin'), OR
 * 2. Request includes valid x-admin-key header matching ADMIN_KEY env var
 * 
 * @param {Request} request - The incoming request object
 * @returns {Promise<boolean>} - True if authorized, false otherwise
 */
export async function isAuthorized(request) {
  // Check session-based authorization first
  const session = await getServerSession(authOptions);
  if (session?.user?.role === 'admin') {
    return true;
  }

  // Check ADMIN_KEY header authorization
  const envKey = cleanKey(process.env.ADMIN_KEY);
  if (envKey) {
    const headerKey = cleanKey(request.headers.get('x-admin-key'));
    return headerKey && headerKey === envKey;
  }

  // No authorization method succeeded
  return false;
}
