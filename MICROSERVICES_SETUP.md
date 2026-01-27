# Microservices Integration Guide

## 🎯 Overview

The frontend has been updated to work with the new microservices architecture using an API Gateway pattern.

## 🚀 Quick Start

### 1. Set Up Environment Variables

Copy the example environment file:
```bash
cp env.example .env.local
```

Edit `.env.local` and configure:
```env
# For local development with microservices
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:9000
NEXT_PUBLIC_USE_API_GATEWAY=true
NEXT_PUBLIC_ENABLE_SERVICE_RETRY=true
```

### 2. Start Your Microservices

Make sure all microservices are running. From your microservices directory:
```bash
cd "d:\project - Copy\Micriservices_absences"
docker-compose up -d
```

Wait for all services to be healthy (~3-4 minutes). Check status:
```bash
docker-compose ps
```

### 3. Verify API Gateway

Check that the API Gateway is running:
```bash
# PowerShell
Invoke-WebRequest -Uri http://localhost:9000/actuator/health

# Or open in browser
start http://localhost:9000/actuator/health
```

### 4. Start Frontend

```bash
npm install  # If needed
npm run dev
```

Visit: http://localhost:3000

## 📝 What Changed

### 1. API Configuration (`src/config/api.ts`)

- **✅ Updated for microservices** with API Gateway support
- **✅ Added retry logic** for failed requests (configurable)
- **✅ Health check utilities** to monitor service status
- **✅ Fallback to direct service URLs** for development

### 2. Service Clients (`src/lib/api-clients/`)

New organized API clients:
- `identity-client.ts` - Authentication & Users
- `student-client.ts` - Students & Enrollments
- `attendance-client.ts` - Attendance tracking
- `academic-structure-client.ts` - Departments, Classes, Modules, Subjects

### 3. Endpoint Changes

⚠️ **Important**: Some endpoints changed in microservices:

| Old Endpoint | New Endpoint | Service |
|--------------|--------------|---------|
| `/api/classes` | `/api/class-groups` | Academic Structure |
| `/api/users/admin/stats` | `/api/users/stats` | Identity |
| `/api/messages/stats` | `/api/messages/stats/:userId` | Messaging |

## 🔧 Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_GATEWAY_URL` | `http://localhost:9000` | API Gateway URL |
| `NEXT_PUBLIC_USE_API_GATEWAY` | `true` | Use Gateway or direct services |
| `NEXT_PUBLIC_ENABLE_SERVICE_RETRY` | `true` | Enable retry on failures |
| `NEXT_PUBLIC_ENABLE_CIRCUIT_BREAKER` | `false` | Enable circuit breaker (future) |
| `NEXT_PUBLIC_ENABLE_API_LOGGING` | `true` | Log API requests/errors |

### Development vs Production

**Development (Local microservices)**
```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:9000
```

**Production (Docker)**
```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080
```

## 🧪 Testing

### 1. Test Authentication

```typescript
import { IdentityServiceClient } from '@/lib/api-clients';

// Login
const response = await IdentityServiceClient.login({
  email: 'test@example.com',
  password: 'password'
});
```

### 2. Test Service Health

```typescript
import { checkGatewayHealth, checkServiceHealth } from '@/lib/api-clients';

// Check Gateway
const isHealthy = await checkGatewayHealth();

// Check specific service
const isStudentServiceUp = await checkServiceHealth('http://localhost:8086');
```

### 3. Test Retry Logic

The retry logic automatically retries failed requests (500, 502, 503, 504 errors):

```typescript
// This will retry up to 3 times if it fails
const students = await StudentServiceClient.getAllStudents(token);
```

## 🚨 Troubleshooting

### Issue: "Cannot connect to API Gateway"

**Solution:**
1. Check if microservices are running:
   ```bash
   docker-compose ps
   ```

2. Verify API Gateway health:
   ```bash
   curl http://localhost:9000/actuator/health
   ```

3. Check logs:
   ```bash
   docker-compose logs api-gateway
   ```

### Issue: "Service not found" errors

**Solution:**
1. Check Eureka dashboard: http://localhost:8761
2. Verify all services are registered
3. Wait for services to fully start (~2-3 minutes after docker-compose up)

### Issue: "CORS errors"

**Solution:**
The API Gateway is configured for CORS. If you still get errors:
1. Check `application.yml` in api-gateway
2. Verify `allowedOrigins` includes your frontend URL

### Issue: "Token expired" immediately

**Solution:**
1. Check system clocks are synchronized
2. Verify JWT_SECRET matches between services
3. Check token expiration settings in Identity Service

## 📊 Service Ports Reference

| Service | Port | URL |
|---------|------|-----|
| **API Gateway** | 9000 (local) / 8080 (docker) | http://localhost:9000 |
| **Eureka Server** | 8761 | http://localhost:8761 |
| **Identity Service** | 8084 | http://localhost:8084 |
| **Academic Year** | 8085 | http://localhost:8085 |
| **Student Service** | 8086 | http://localhost:8086 |
| **Academic Structure** | 8087 | http://localhost:8087 |
| **Instructor Service** | 8088 | http://localhost:8088 |
| **Attendance Service** | 8090 | http://localhost:8090 |
| **Messaging Service** | 8091 | http://localhost:8091 |
| **Notification Service** | 8092 | http://localhost:8092 |
| **Report Service** | 8093 | http://localhost:8093 |
| **Admin Service** | 8094 | http://localhost:8094 |
| **Manager Service** | 8095 | http://localhost:8095 |

## 🔐 Security Notes

1. **JWT Tokens**: Handled by API Gateway JWT filter
2. **CORS**: Configured in API Gateway
3. **HTTPS**: Use HTTPS in production (not configured by default)
4. **Secrets**: Never commit `.env.local` to git

## 📚 Migration Checklist

- [x] Update API configuration
- [x] Create service clients
- [x] Add retry logic
- [x] Add health checks
- [ ] Update AuthContext (manual step needed)
- [ ] Update StudentContext (manual step needed)
- [ ] Update InstructorContext (manual step needed)
- [ ] Test all user roles
- [ ] Test error scenarios
- [ ] Update documentation

## 🔄 Rollback

If you need to revert to the old monolithic backend:

1. Update `.env.local`:
   ```env
   NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080
   NEXT_PUBLIC_USE_API_GATEWAY=false
   ```

2. Or revert `src/config/api.ts` from git history

## 📞 Support

For issues:
1. Check microservices logs: `docker-compose logs -f [service-name]`
2. Check frontend console for errors
3. Verify environment variables are set correctly

## 🎓 Next Steps

1. **Update Contexts**: Modify AuthContext, StudentContext, and InstructorContext to use new service clients
2. **Test thoroughly**: Test all user flows (login, student dashboard, professor features, admin panel)
3. **Monitor**: Add monitoring dashboard to track service health
4. **Optimize**: Implement caching with React Query or SWR

---

**Last Updated**: January 25, 2026  
**Microservices**: 11 services  
**Frontend Framework**: Next.js 15.3.5
