# Load Testing Guide

## Files

- **`loadtest.js`** - Comprehensive load test with realistic scenarios (800 VUs peak)
- **`scriptBooking.js`** - Simple booking flow test (10 VUs max)

## Quick Start

### 1. Run Simple Booking Test

```bash
k6 run scriptBooking.js
```

### 2. Run Full Load Test

```bash
k6 run loadtest.js
```

### 3. Custom Load Test

```bash
# Test with specific VUs and duration
k6 run --vus 100 --duration 5m loadtest.js

# Test against local server
k6 run --env BASE_URL=http://localhost:3001 loadtest.js

# Generate HTML report
k6 run --out json=results.json loadtest.js
```

## Load Test Scenarios

### loadtest.js - Comprehensive Test

**Load Profile:**
- Warm-up: 0 → 50 VUs (30s)
- Moderate: 50 → 400 VUs (7m)
- Peak: 400 → 800 VUs (5m)
- Cool down: 800 → 0 (2.5m)

**Total Duration:** 15 minutes

**Scenarios:**
1. Login
2. Browse events (paginated)
3. View event details
4. Create order
5. Process payment
6. Verify wallet

**Custom Metrics:**
- `booking_success` - Booking success rate
- `order_creation_duration` - Order creation time
- `payment_duration` - Payment processing time

**Thresholds:**
- p95 < 2s overall
- p95 < 1s for login
- p95 < 1.5s for events
- 98% booking success rate

### scriptBooking.js - Simple Test

**Load Profile:**
- Ramp-up: 0 → 5 VUs (1m)
- Sustained: 5 → 10 VUs (3m)
- Ramp-down: 10 → 0 (1m)

**Total Duration:** 5 minutes

**Use Cases:**
- Quick smoke tests
- Development testing
- CI/CD integration

## Expected Results

### Before Optimization
```
http_req_duration:
  avg=1.17s  p(90)=2.76s  p(95)=4.07s

http_req_failed: 0.08%
booking_success: ~92%
```

### After Phase 1 Optimization
```
http_req_duration:
  avg=~800ms  p(90)=~2.0s  p(95)=~2.8s

http_req_failed: <0.1%
booking_success: >98%
```

### Target (Phase 2)
```
http_req_duration:
  avg=~500ms  p(90)=~1.5s  p(95)=~1.8s

http_req_failed: <0.05%
booking_success: >99%
```

## Troubleshooting

### No users found
```bash
# Ensure dummy_users.csv exists
ls dummy_users.csv

# Regenerate if needed
npm run seed:users
```

### Connection errors
```bash
# Check server is running
curl https://zenvy.com.bd/api/health

# Test locally
k6 run --env BASE_URL=http://localhost:3001 loadtest.js
```

### High error rate
- Check server logs for errors
- Verify database indexes are created
- Monitor MongoDB performance
- Check connection pool settings

## Monitoring During Test

### Terminal 1: Run k6
```bash
k6 run loadtest.js
```

### Terminal 2: Monitor Server
```bash
# SSH to production
ssh root@72.61.249.155

# Watch logs
pm2 logs server --lines 100

# Monitor resources
htop
```

### Terminal 3: Monitor MongoDB
```bash
# Connect to MongoDB
mongosh

# Watch operations
db.currentOp()

# Check slow queries
db.system.profile.find().sort({ts:-1}).limit(5)
```

## CI/CD Integration

```yaml
# .github/workflows/load-test.yml
name: Load Test

on:
  push:
    branches: [main]

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Run k6 test
        uses: grafana/k6-action@v0.3.0
        with:
          filename: scriptBooking.js
          flags: --vus 10 --duration 2m
```

## Advanced Usage

### Multiple Scenarios

```javascript
// Run different scenarios with weights
export const options = {
  scenarios: {
    booking: {
      executor: 'ramping-vus',
      exec: 'default',
      stages: [
        { duration: '5m', target: 400 },
      ],
    },
    browsing: {
      executor: 'constant-vus',
      exec: 'browseOnly',
      vus: 100,
      duration: '5m',
    },
  },
};
```

### Custom Thresholds

```javascript
thresholds: {
  'http_req_duration{name:create_order}': ['p(99)<3000'],
  'http_req_duration{name:payment_callback}': ['p(95)<1500'],
  'booking_success': ['rate>0.99'],
},
```
