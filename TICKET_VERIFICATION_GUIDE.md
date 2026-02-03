# 🎟️ Zenvy Ticket Verification API Guide

This guide explains how to verify Zenvy tickets using our API. This is ideal for building custom scanner apps or integrating with entrance control systems.

## 📍 Endpoint Details

- **Method:** `POST`
- **URL:** `{{BASE_URL}}/api/ticket/verify/:eventId`
- **Authentication:** None (Public endpoint for rapid scanning)
- **Content-Type:** `application/json`

### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `eventId` | String | The unique ID of the event you are scanning for. |

---

## 📥 Request Body

You need to send the raw data extracted from the ticket's QR code.

```json
{
  "qrData": "ZEN-XXXX-YYYY-ZZZZ"
}
```

---

## 📤 Response Format

The API returns a JSON object indicating whether the ticket is valid for entry.

### 1. Success (Valid Ticket)
When a ticket is valid and hasn't been used yet, the system automatically checks the user in.

```json
{
  "valid": true,
  "ticketNumber": "ZEN-12345",
  "ticketType": "VIP",
  "userId": "65a...",
  "eventTitle": "Grand Concert 2024",
  "checkedInAt": "2024-02-03T17:40:00Z"
}
```

### 2. Failure Reasons
If the ticket is invalid, you will receive `valid: false` along with a specific `reason`.

| Reason | Description |
|--------|-------------|
| `INVALID_QR` | The QR data does not match any ticket in our database. |
| `TICKET_INVALID` | The ticket exists but has been cancelled or is otherwise inactive. |
| `EVENT_MISMATCH` | This ticket is valid, but for a **different event**. |
| `TICKET_EXPIRED` | The ticket's validity period has passed. |
| `ALREADY_USED` | This ticket was already scanned and checked in. |

**Example Failure Response:**
```json
{
  "valid": false,
  "reason": "ALREADY_USED",
  "checkedInAt": "2024-02-03T16:00:00Z"
}
```

---

## 💻 Code Examples

### Using `curl`
```bash
curl -X POST http://localhost:3001/api/ticket/verify/YOUR_EVENT_ID \
     -H "Content-Type: application/json" \
     -d '{"qrData": "EXTRACTED_QR_DATA"}'
```

### Using JavaScript (Fetch)
```javascript
const verifyTicket = async (eventId, qrData) => {
  const response = await fetch(`https://api.zenvy.inc/api/ticket/verify/${eventId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrData })
  });

  const result = await response.json();
  
  if (result.valid) {
    console.log("Welcome!", result.eventTitle);
  } else {
    console.error("Access Denied:", result.reason);
  }
};
```

---
*For advanced integration or high-volume scanning, please contact Zenvy Engineering.*
