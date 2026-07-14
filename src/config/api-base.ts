const USE_API_GATEWAY = process.env.NEXT_PUBLIC_USE_API_GATEWAY !== 'false';
// This project's gateway is run on 9000 (application.yml default), not the
// Docker Compose 8080 mapping — confirmed by the user.
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:9000';

// Fallback to individual services (for development/testing), using the Docker
// Compose port mapping — education-core-service and communication-hub-service
// override their application.yml ports (8097/8096) to 8085/8091.
const SERVICE_URLS = {
  EDUCATION_CORE: process.env.NEXT_PUBLIC_EDUCATION_CORE_SERVICE_URL || 'http://localhost:8085',
  IDENTITY: process.env.NEXT_PUBLIC_IDENTITY_SERVICE_URL || 'http://localhost:8084',
  COMMUNICATION_HUB: process.env.NEXT_PUBLIC_COMMUNICATION_HUB_SERVICE_URL || 'http://localhost:8091',
};

const ENABLE_RETRY = process.env.NEXT_PUBLIC_ENABLE_SERVICE_RETRY === 'true';

// Base URL selection
const getBaseURL = (serviceName?: keyof typeof SERVICE_URLS) => {
  if (USE_API_GATEWAY) {
    return API_GATEWAY_URL;
  }
  if (!serviceName) {
    return SERVICE_URLS.EDUCATION_CORE || API_GATEWAY_URL;
  }
  return SERVICE_URLS[serviceName] || API_GATEWAY_URL;
};

const IDENTITY_BASE = getBaseURL('IDENTITY');
const EDUCATION_CORE_BASE = getBaseURL('EDUCATION_CORE');
const COMMUNICATION_HUB_BASE = getBaseURL('COMMUNICATION_HUB');

const API_CONFIG = {
  GATEWAY_URL: API_GATEWAY_URL,
  USE_GATEWAY: USE_API_GATEWAY,
  SERVICE_URLS,
  ENABLE_RETRY,
};

export {
  USE_API_GATEWAY,
  API_GATEWAY_URL,
  SERVICE_URLS,
  ENABLE_RETRY,
  getBaseURL,
  IDENTITY_BASE,
  EDUCATION_CORE_BASE,
  COMMUNICATION_HUB_BASE,
  API_CONFIG,
};
