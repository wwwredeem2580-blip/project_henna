# Email Worker Usage Audit

This document lists all occurrences of `addEmailJob` usage within the server codebase, detailing the file location, line number, email case type, and payload structure.

## 1. Workers

### `src/workers/payout.worker.ts`
*   **Line:** 229
*   **Case Name:** `PAYOUT_GENERATED`
*   **Queue Type:** `email-notification`
*   **Payload:**
    ```typescript
    {
      host: any,
      payout: any,
      event: any
    }
    ```

### `src/workers/ticketSheetNotification.worker.ts`
*   **Line:** 99
*   **Case Name:** `TICKET_SHEET_REMINDER`
*   **Queue Type:** `TICKET_SHEET_REMINDER` (Direct Type)
*   **Payload:**
    ```typescript
    {
      hostName: string,
      hostEmail: string,
      eventTitle: string,
      eventDate: string,
      eventTime: string,
      venue: string,
      totalTickets: number,
      downloadUrl: string,
      timing: '24h' | '3h',
      hoursUntilEvent: number
    }
    ```

## 2. Order Module

### `src/modules/order/service.ts`
*   **Line:** 463
*   **Case Name:** `ORDER_CONFIRMATION`
*   **Queue Type:** `ORDER_CONFIRMATION` (Direct Type)
*   **Payload:**
    ```typescript
    {
      orderNumber: string,
      buyerName: string,
      buyerEmail: string,
      eventTitle: string,
      eventDate: string,
      eventTime: string,
      venue: string,
      venueAddress: string,
      tickets: Array<{
        ticketType: string,
        quantity: number,
        price: number
      }>,
      totalAmount: number,
      paymentMethod: string,
      transactionId: string
    }
    ```

### `src/utils/order/completeOrder.ts`
*   **Line:** 80
*   **Case Name:** `ORDER_CONFIRMATION`
*   **Queue Type:** `ORDER_CONFIRMATION` (Direct Type)
*   **Payload:** Same as above.

## 3. Event Utilities

### `src/utils/event/processAutomaticPriceReductionRefunds.ts`
*   **Line:** 58
*   **Case Name:** `PRICE_REDUCTION_REFUND`
*   **Queue Type:** `email-notification`
*   **Payload:**
    ```typescript
    {
      order: any,
      user: { name: string, email: string },
      event: any,
      refundAmount: number,
      oldPrice: number,
      newPrice: number,
      ticketType: string
    }
    ```

*   **Line:** 81
*   **Case Name:** `PRICE_REDUCTION_REFUND_SUMMARY`
*   **Queue Type:** `email-notification`
*   **Payload:**
    ```typescript
    {
      host: { name: string, email: string },
      event: any,
      ticketName: string,
      oldPrice: number,
      newPrice: number,
      totalRefunded: number,
      affectedOrders: number
    }
    ```

## 4. Auth Module

### `src/modules/auth/email/service.ts`
*   **Line:** 199
*   **Case Name:** `EMAIL_VERIFICATION`
*   **Queue Type:** `EMAIL_VERIFICATION` (Direct Type)
*   **Payload:**
    ```typescript
    {
      name: string,
      email: string,
      verificationLink: string
    }
    ```

## 5. Admin Modules

### `src/modules/admin/payout/service.ts`

*   **Line:** 158
*   **Case Name:** `EVENT_WITHDRAW_APPROVAL` (Note: Used inside `approvePayoutService` - potential copy/paste error? Should likely be `PAYOUT_APPROVED`)
*   **Queue Type:** `email-notification`
*   **Payload:**
    ```typescript
    {
      hostEmail: string,
      hostName: string,
      payout: any
    }
    ```

*   **Line:** 198
*   **Case Name:** `PAYOUT_REJECTION`
*   **Queue Type:** `email-notification`
*   **Payload:**
    ```typescript
    {
      hostEmail: string,
      hostName: string,
      payout: any
    }
    ```

*   **Line:** 234
*   **Case Name:** `PAYOUT_ON_HOLD`
*   **Queue Type:** `email-notification`
*   **Payload:**
    ```typescript
    {
      hostEmail: string,
      hostName: string,
      payout: any
    }
    ```

*   **Line:** 286
*   **Case Name:** `PAYOUT_COMPLETED`
*   **Queue Type:** `email-notification`
*   **Payload:**
    ```typescript
    {
      hostEmail: string,
      hostName: string,
      payout: any
    }
    ```

### `src/modules/admin/order/service.ts`

*   **Line:** 224
*   **Case Name:** `REFUND_CONFIRMATION`
*   **Queue Type:** `email-notification`
*   **Payload:**
    ```typescript
    {
      order: any,
      user: { name: string, email: string },
      event: any,
      refundAmount: number
    }
    ```

### `src/modules/admin/event/service.ts`

*   **Line:** 94
*   **Case Name:** `EVENT_APPROVED`
*   **Queue Type:** `email-notification`
*   **Payload:** `{ hostEmail, hostName, eventTitle }`

*   **Line:** 135
*   **Case Name:** `EVENT_REJECTED`
*   **Queue Type:** `email-notification`
*   **Payload:** `{ hostEmail, hostName, eventTitle, reason, eventId }`

*   **Line:** 185
*   **Case Name:** `EVENT_FEATURED`
*   **Queue Type:** `email-notification`
*   **Payload:** `{ hostEmail, hostName, eventTitle, eventId }`

*   **Line:** 224
*   **Case Name:** `EVENT_UNFEATURED`
*   **Queue Type:** `email-notification`
*   **Payload:** `{ hostEmail, hostName, eventTitle, eventId }`

*   **Line:** 272
*   **Case Name:** `EVENT_SUSPENDED`
*   **Queue Type:** `email-notification`
*   **Payload:** `{ hostEmail, hostName, eventTitle, eventId }`

*   **Line:** 313
*   **Case Name:** `EVENT_UNSUSPENDED`
*   **Queue Type:** `email-notification`
*   **Payload:** `{ hostEmail, hostName, eventTitle, eventId }`

*   **Line:** 359
*   **Case Name:** `EVENT_SALES_PAUSED`
*   **Queue Type:** `email-notification`
*   **Payload:** `{ hostEmail, hostName, eventTitle, eventId }`

*   **Line:** 369
*   **Case Name:** `EVENT_SALES_RESUMED`
*   **Queue Type:** `email-notification`
*   **Payload:** `{ hostEmail, hostName, eventTitle, eventId }`

*   **Line:** 407
*   **Case Name:** `EVENT_UNLISTED`
*   **Queue Type:** `email-notification`
*   **Payload:** `{ hostEmail, hostName, eventTitle, eventId }`

*   **Line:** 417
*   **Case Name:** `EVENT_PUBLIC`
*   **Queue Type:** `email-notification`
*   **Payload:** `{ hostEmail, hostName, eventTitle, eventId }`

*   **Line:** 452
*   **Case Name:** `EVENT_WITHDRAW_APPROVAL`
*   **Queue Type:** `email-notification`
*   **Payload:** `{ hostEmail, hostName, eventTitle, eventId }`
