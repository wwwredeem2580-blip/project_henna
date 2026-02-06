# Ticket Booking & Order Flow Documentation

This document details the complete technical flow of the ticket booking system in Zenvy, from the initial API request to the final ticket generation.

## 1. Booking Initiation
**Endpoint:** `POST /api/order`  
**Auth:** Required (User)

The process begins when a user clicks "Checkout" on the frontend.

### A. Validation Layer
Before checking inventory, we validate the request:
1.  **Event Status**: Must be `published` or `live`. Sales must NOT be paused.
2.  **Event Dates**: Event must not have ended.
3.  **User Limits**:
    *   **Event Limit**: User cannot exceed total tickets allowed per event (e.g., 5).
    *   **Tier Limit**: User cannot exceed limits for a specific ticket type (e.g., 2 VIPs).

### B. Inventory Reservation (Optimistic Locking)
To prevent overselling without complex locking, we use **Optimistic Concurrency Control**:
1.  Fetch the current `sold` and `reserved` counts for the ticket variant.
2.  Check if `Available = Quantity - Sold - Reserved` is sufficient.
3.  Atomic Update:
    ```typescript
    Event.updateOne(
      { _id: eventId, "tickets._id": variantId, "tickets.sold": currentSold },
      { $inc: { "tickets.$.reserved": requestedQty } }
    )
    ```
4.  **Result**: If `modifiedCount === 0`, it means someone else bought the ticket in the millisecond between read and write. We throw an error and ask the user to retry.

### C. Order Creation
We create an `Order` record with status `pending`.
*   **Expiration**: set to 15 minutes from now. If payment isn't completed by then, a background job (cron) cleans up the reservation.

---

## 2. Payment Processing
We support **bKash** as our primary payment gateway.

### A. Payment Initiation
1.  Service calls `dummyCreatePayment` (simulating bKash API).
2.  Creates a `Payment` record in our database:
    *   `status`: `pending`
    *   `amount`: Matches order subtotal.
3.  **Client Response**: Returns a `paymentUrl` (bKash gateway URL).
4.  **Frontend**: Redirects the user to this URL.

### B. Free Tickets
If the order total is **0 BDT**:
1.  Skips the payment gateway.
2.  Sets status directly to `confirmed`.
3.  Immediately calls **Order Completion** (see Section 4).

---

## 3. Payment Confirmation (Callback)
**Endpoint:** `GET /api/order/bkash/callback`

After payment, bKash redirects the user back to this URL.

### A. Verification Steps
1.  **Idempotency**: Checks if usage of this `paymentId` has already succeeded.
2.  **Gateway Verification**: Calls bKash API (`executePayment`) to verify the transaction is real.
3.  **Security Checks** (Critical):
    *   **Amount Mismatch**: Compares `payment.amount` from bKash with `order.subtotal`. If they differ, flags as `suspicious` and blocks the order.
    *   **Currency Check**: Ensures currency is `BDT`.

### B. Payment Recording
*   Updates `Payment` record to `succeeded`.
*   Stores `transactionId` and `paymentDetails`.

---

## 4. Order Completion Flow
Once payment is verified (or skipped for free tickets), the system finalizes the order.

### A. Status Updates
*   `Order.status` -> `confirmed`
*   `Order.paymentStatus` -> `succeeded`
*   `Order.paidAt` -> `new Date()`

### B. Inventory Finalization
We convert the "Reserved" slots to permanent "Sold" slots.
```typescript
Event.updateOne(
  { ... },
  { 
    $set: { "tickets.$.reserved": newReserved }, // Remove reservation
    $inc: { "tickets.$.sold": quantity }         // Add to permanent sold count
  }
)
```

### C. Ticket Generation
For every quantity purchased, we generate a unique `Ticket` record:
1.  **Unique ID**: A hash/UUID for the ticket.
2.  **QR Hash**: A secure string used for scanning.
3.  **Metadata**: Links to User, Event, and specific Order.

### D. Metrics & Notifications
1.  **Event Analytics**: Updates total revenue and global sales counters.
2.  **PDF Cache**: Invalidates any cached ticket lists for this event.
3.  **Email**: Adds a job to the `Email Queue`:
    *   Subject: "Order Confirmation"
    *   Attachment: Order Summary (and usually PDF links).
