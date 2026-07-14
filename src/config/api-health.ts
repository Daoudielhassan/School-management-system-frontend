import { API_GATEWAY_URL } from './api-base';

export async function checkServiceHealth(serviceUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${serviceUrl}/actuator/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function checkGatewayHealth(): Promise<boolean> {
  return checkServiceHealth(API_GATEWAY_URL);
}
