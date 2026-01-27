/**
 * API Clients for Microservices
 * 
 * Centralized export for all service clients
 */

export { IdentityServiceClient } from './identity-client';
export { StudentServiceClient } from './student-client';
export { EnhancedAttendanceClient } from './attendance-client';
export { AcademicStructureClient } from './academic-structure-client';
export { SessionServiceClient } from './session-client';
export { ReportsServiceClient } from './reports-client';
export { AdminServiceClient } from './admin-client';
export { MessagingServiceClient } from './messaging-client';
export { NotificationServiceClient } from './notification-client';
export { ManagerServiceClient } from './manager-client';

// Re-export API config and helpers
export { API_ENDPOINTS, API_CONFIG, apiGet, apiPost, apiPut, apiDelete, checkServiceHealth, checkGatewayHealth } from '@/config/api';
