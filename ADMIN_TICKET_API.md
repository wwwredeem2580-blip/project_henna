# 🎫 Admin Ticket Management API Documentation

Complete guide for the 4 admin ticket management endpoints with cursor-based pagination and audit logging.

---

## 📍 Endpoint Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/ticket` | List tickets with filters (cursor pagination) |
| PUT | `/api/admin/ticket/:ticketId/status` | Update ticket status (with validation) |
| POST | `/api/admin/ticket/:ticketId/checkin` | Manual check-in (fallback) |
| GET | `/api/admin/ticket/event/:eventId` | Export event tickets (enriched data) |

---

## 1️⃣ List Tickets (Cursor Pagination)

**Endpoint:** `GET /api/admin/ticket`

### Query Parameters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `cursor` | String | Last ticketNumber from previous page | `TKT-EVT123-A3K9-50` |
| `limit` | Number | Results per page (1-100, default: 50) | `50` |
| `status` | String | Filter by status | `valid`, `cancelled`, `refunded` |
| `eventId` | String | Filter by event ID | `65a1b2c3d4e5f6g7h8i9j0k1` |
| `orderId` | String | Filter by order ID | `65a1b2c3d4e5f6g7h8i9j0k1` |
| `email` | String | Filter by buyer email (partial match) | `john@example.com` |
| `ticketNumber` | String | Search by ticket number (partial match) | `TKT-123` |

### Example Request
```bash
curl -X GET "http://localhost:3001/api/admin/ticket?limit=50&status=valid&email=john@example.com" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Response Format
```json
{
  "tickets": [
    {
      "_id": "65a...",
      "ticketNumber": "TKT-EVT123-A3K9-01",
      "status": "valid",
      "checkInStatus": "not_checked_in",
      "eventTitle": "Grand Concert 2024",
      "ticketType": "VIP Pass",
      "price": 5000,
      "buyerEmail": "john@example.com",
      "buyerName": "John Doe",
      "orderNumber": "ORD-2024-001",
      "paymentStatus": "confirmed",
      "issuedAt": "2024-02-01T10:00:00Z",
      "validUntil": "2024-03-01T23:59:59Z",
      "checkedInAt": null
    }
  ],
  "pagination": {
    "nextCursor": "TKT-EVT123-A3K9-50",
    "hasMore": true,
    "limit": 50
  }
}
```

### Pagination Flow
```javascript
// First page
let cursor = null;
let allTickets = [];

while (true) {
  const response = await fetch(`/api/admin/ticket?cursor=${cursor || ''}&limit=50`);
  const data = await response.json();
  
  allTickets.push(...data.tickets);
  
  if (!data.pagination.hasMore) break;
  cursor = data.pagination.nextCursor;
}
```

---

## 2️⃣ Update Ticket Status

**Endpoint:** `PUT /api/admin/ticket/:ticketId/status`

### Request Body
```json
{
  "newStatus": "cancelled",
  "adminId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "reason": "Customer requested cancellation"
}
```

### Validation Rules
| From Status | To Status | Allowed? | Reason |
|-------------|-----------|----------|--------|
| `valid` | `cancelled` | ✅ Yes | Normal cancellation |
| `valid` | `refunded` | ✅ Yes | Refund processing |
| `refunded` | `valid` | ❌ No | Cannot reactivate refunded tickets |
| `used` | `valid` | ❌ No | Cannot reactivate used tickets |
| `cancelled` | `valid` | ❌ No | Cannot reactivate cancelled tickets |
| `checked_in` | `valid` | ❌ No | Cannot change status of checked-in tickets |

### Example Request
```bash
curl -X PUT "http://localhost:3001/api/admin/ticket/65a.../status" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -d '{
       "newStatus": "cancelled",
       "adminId": "65a1b2c3d4e5f6g7h8i9j0k1",
       "reason": "Duplicate purchase"
     }'
```

### Success Response
```json
{
  "success": true,
  "message": "Ticket status updated successfully",
  "ticket": {
    "_id": "65a...",
    "ticketNumber": "TKT-EVT123-A3K9-01",
    "status": "cancelled",
    "previousStatus": "valid"
  }
}
```

### Error Response
```json
{
  "error": "Cannot reactivate refunded tickets",
  "statusCode": 403
}
```

### Audit Log Entry
Every status change creates an audit log:
```json
{
  "action": "TICKET_STATUS_CHANGED",
  "resource": "ticket",
  "resourceId": "65a...",
  "adminId": "65a...",
  "changes": {
    "before": { "status": "valid" },
    "after": { "status": "cancelled" }
  },
  "metadata": {
    "ticketNumber": "TKT-EVT123-A3K9-01",
    "reason": "Duplicate purchase"
  },
  "timestamp": "2024-02-04T11:30:00Z"
}
```

---

## 3️⃣ Manual Check-In

**Endpoint:** `POST /api/admin/ticket/:ticketId/checkin`

### Request Body
```json
{
  "adminId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

### Validation Rules
- Ticket must have `status: 'valid'`
- Ticket must have `checkInStatus: 'not_checked_in'`
- Ticket must not be expired (`validUntil > now`)
- If already checked in → **Block** with error

### Example Request
```bash
curl -X POST "http://localhost:3001/api/admin/ticket/65a.../checkin" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -d '{ "adminId": "65a1b2c3d4e5f6g7h8i9j0k1" }'
```

### Success Response
```json
{
  "success": true,
  "message": "Ticket checked in successfully",
  "ticket": {
    "_id": "65a...",
    "ticketNumber": "TKT-EVT123-A3K9-01",
    "checkInStatus": "checked_in",
    "checkedInAt": "2024-02-04T11:30:00Z"
  }
}
```

### Error Responses
```json
// Already checked in
{
  "error": "Ticket already checked in",
  "statusCode": 400
}

// Invalid status
{
  "error": "Cannot check in ticket with status: cancelled",
  "statusCode": 400
}

// Expired
{
  "error": "Ticket has expired",
  "statusCode": 400
}
```

---

## 4️⃣ Get Event Tickets (Export)

**Endpoint:** `GET /api/admin/ticket/event/:eventId`

### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `cursor` | String | Last ticketNumber from previous page |
| `limit` | Number | Results per page (1-200, default: 100) |

### Example Request
```bash
curl -X GET "http://localhost:3001/api/admin/ticket/event/65a.../tickets?limit=100" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Response Format
```json
{
  "event": {
    "_id": "65a...",
    "title": "Grand Concert 2024",
    "venue": {
      "name": "National Stadium",
      "address": { "city": "Dhaka", "country": "Bangladesh" }
    },
    "schedule": {
      "startDate": "2024-03-01T18:00:00Z",
      "endDate": "2024-03-01T23:00:00Z"
    },
    "ticketTiers": [
      { "_id": "65a...", "tier": "VIP", "price": 5000, "quantity": 100 }
    ]
  },
  "tickets": [
    {
      "ticketNumber": "TKT-EVT123-A3K9-01",
      "status": "valid",
      "checkInStatus": "checked_in",
      "price": 5000,
      "issuedAt": "2024-02-01T10:00:00Z",
      "validUntil": "2024-03-01T23:59:59Z",
      "checkedInAt": "2024-03-01T18:30:00Z",
      "ticketType": "VIP Pass",
      "buyerEmail": "john@example.com",
      "buyerName": "John Doe",
      "orderNumber": "ORD-2024-001",
      "paymentStatus": "confirmed",
      "eventTitle": "Grand Concert 2024",
      "eventVenue": "National Stadium",
      "eventSchedule": {
        "startDate": "2024-03-01T18:00:00Z",
        "endDate": "2024-03-01T23:00:00Z"
      }
    }
  ],
  "pagination": {
    "nextCursor": "TKT-EVT123-A3K9-100",
    "hasMore": true,
    "limit": 100
  }
}
```

---

## 🔒 Security & Audit

### Global Audit Log
All admin actions are logged in the `AuditLog` collection:

**Tracked Actions:**
- `TICKET_STATUS_CHANGED`
- `MANUAL_CHECKIN`

**Query Audit Logs:**
```javascript
// Get all actions for a specific ticket
const logs = await getResourceAuditLogs(ticketId, 50);

// Get all actions by an admin
const adminLogs = await getAdminAuditLogs(adminId, 100);
```

---

## 📊 Performance Notes

- **Cursor Pagination**: Efficient for 100K+ tickets (no skip overhead)
- **Indexes**: `ticketNumber`, `eventId`, `orderId`, `userId`, `status`
- **Aggregation**: Event ticket export uses MongoDB aggregation pipeline
- **Limit Caps**: Max 100 for general listing, max 200 for event export

---

*For integration support, contact Zenvy Engineering.*
