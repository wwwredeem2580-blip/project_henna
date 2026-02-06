import { group, sleep } from 'k6'
import http from 'k6/http'

export const options = {
  stages: [
    // Ramp-up
    { duration: '2m', target: 200 },   
    { duration: '3m', target: 400 },   
    // Peak load
    { duration: '5m', target: 500 },  
    // Ramp-down
    { duration: '2m', target: 200 },    
  ],
  thresholds: {
    http_req_failed: ['rate<0.02'],       // max 2% failed requests
    http_req_duration: ['p(95)<2000'],    // 95% requests < 2s
  },
  // Cloud execution (optional)
  cloud: {
    distribution: {
      'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 },
    },
  },
}

export default function main() {
  // Simulate homepage visit
  group('Homepage', () => {
    http.get('https://zenvy.com.bd')
    sleep(Math.random() * 2 + 1)  // 1-3 seconds think time
  })

  // Simulate user visiting events page
  group('Events Page', () => {
    http.get('https://zenvy.com.bd/events')
    sleep(Math.random() * 2 + 1)
  })

  // Simulate authentication
  group('Auth', () => {
    http.get('https://zenvy.com.bd/auth')
    sleep(Math.random() * 2 + 1)
  })

  // Simulate onboarding page
  group('Onboarding', () => {
    http.get('https://zenvy.com.bd/onboarding')
    sleep(Math.random() * 2 + 1)
  })

  // Simulate public API access
  group('Public Event API', () => {
    http.get('https://zenvy.com.bd/api/event/public')
    sleep(Math.random() * 2 + 1)
  })
}