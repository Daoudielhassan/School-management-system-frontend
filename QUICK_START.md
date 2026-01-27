# 🚀 Microservices Quick Start

## 1. Setup (First Time)

```bash
# Frontend directory
cd "d:\project - Copy\frontend-school management system"

# Copy environment file
cp env.example .env.local

# Edit .env.local and set:
# NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:9000
```

## 2. Start Microservices

```bash
# Microservices directory
cd "d:\project - Copy\Micriservices_absences"

# Start all services
docker-compose up -d

# Check status (wait ~3-4 min for all to be healthy)
docker-compose ps

# View logs
docker-compose logs -f api-gateway
```

## 3. Start Frontend

```bash
# Frontend directory
cd "d:\project - Copy\frontend-school management system"

# Start dev server
npm run dev

# Visit: http://localhost:3000
```

## 4. Verify Services

### Check Eureka (Service Registry)
http://localhost:8761

### Check API Gateway Health
http://localhost:9000/actuator/health

### Check Individual Services
- Identity: http://localhost:8084/actuator/health
- Student: http://localhost:8086/actuator/health
- Attendance: http://localhost:8090/actuator/health

## 5. Using Service Clients

```typescript
// Import clients
import { 
  IdentityServiceClient,
  StudentServiceClient,
  AttendanceServiceClient 
} from '@/lib/api-clients';

// Login
const auth = await IdentityServiceClient.login({
  email: 'user@example.com',
  password: 'password'
});

// Get student data
const student = await StudentServiceClient.getStudentByUserId(
  userId, 
  token
);

// Get attendance
const attendance = await AttendanceServiceClient.getAttendanceByStudent(
  studentId,
  token
);
```

## 6. Common Commands

### Stop Services
```bash
docker-compose down
```

### Restart Single Service
```bash
docker-compose restart identity-service
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service  
docker-compose logs -f student-service

# Last 100 lines
docker-compose logs --tail=100 api-gateway
```

### Rebuild Service
```bash
docker-compose up -d --build identity-service
```

## 7. Troubleshooting

### Services won't start
```bash
# Check Docker is running
docker ps

# Check ports aren't in use
netstat -ano | findstr :9000
netstat -ano | findstr :8761
```

### Gateway not responding
```bash
# Check Eureka first
start http://localhost:8761

# Verify services are registered
# Then restart gateway
docker-compose restart api-gateway
```

### Frontend can't connect
```bash
# Verify .env.local has correct URL
cat .env.local | findstr GATEWAY

# Should show: NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:9000
```

## 8. Service Ports

| Service | Port |
|---------|------|
| Gateway | 9000 |
| Eureka | 8761 |
| Identity | 8084 |
| Student | 8086 |
| Attendance | 8090 |
| Messaging | 8091 |

## 9. Environment Switching

### Local Development
```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:9000
```

### Docker Network
```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080
```

## 10. Next Steps

1. ✅ Services running? → Proceed to test login
2. ✅ Login works? → Test student/professor features
3. ❌ Errors? → Check `MICROSERVICES_SETUP.md` for detailed troubleshooting

---

**Need Help?** See `MICROSERVICES_SETUP.md` for detailed guide
