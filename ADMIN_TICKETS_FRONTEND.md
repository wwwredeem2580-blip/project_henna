# Admin Tickets Frontend - Implementation Notes

## 🎯 Design Decisions Based on Interview

### 1. **Pagination: Load More Pattern**
- **Why**: More natural for cursor-based pagination
- **Implementation**: 
  - "Load More" button at bottom
  - Appends new tickets to existing list
  - Shows count: "Showing X tickets • More available"
- **Trade-off**: Can't jump to specific pages, but simpler state management

### 2. **Filters: Advanced Modal**
- **Why**: Keeps UI clean while providing powerful filtering
- **Implementation**:
  - Single "Advanced Filters" button with badge count
  - Modal with all 5 filter fields
  - Active filters displayed as removable chips
  - "Clear all" quick action
- **Trade-off**: Requires extra click, but prevents UI clutter

### 3. **Table Columns**
Selected columns for optimal information density:
- **Ticket #** (monospace font for readability)
- **Event** (truncated with title attribute)
- **Buyer** (email only, no name to save space)
- **Type** (VIP, General, etc.)
- **Status** (badge: Valid, Cancelled, Refunded, etc.)
- **Check-In** (separate badge: Not Checked In, Checked In)
- **Issued** (date only, formatted)
- **Action** (dropdown menu)

### 4. **Action Menu Items**
Conditional actions based on ticket state:
- **View Details**: Always available
- **Change Status**: Only if allowed transitions exist
- **Manual Check-In**: Only if `checkInStatus === 'not_checked_in'` AND `status === 'valid'`

### 5. **Status Transition Validation**
Client-side validation prevents invalid operations:
```typescript
const transitions = {
  valid: ['cancelled', 'refunded'],
  used: [], // Cannot change
  cancelled: [], // Cannot reactivate
  refunded: [], // Cannot reactivate
  transferred: ['cancelled'],
};
```

### 6. **Modal Designs**

#### Change Status Modal
- Shows current status prominently
- Dropdown with ONLY allowed transitions
- Optional reason field (always optional per user request)
- Warning note about audit logging

#### Manual Check-In Modal
- Confirmation required (irreversible action)
- Shows ticket details for verification
- Green theme (success intent)
- Logs admin ID automatically

### 7. **Error Handling**
- **Inline error banner** with retry button
- **Empty state** with helpful suggestions
- **Clear all filters** quick action when no results

### 8. **Performance Optimizations**
- Virtual scrolling ready (not implemented yet, waiting for WebSocket)
- Debounced search (300ms)
- Lean API responses
- Optimistic UI updates (pending WebSocket)

---

## 🔌 WebSocket Integration (TODO)

### Planned Implementation
```typescript
useEffect(() => {
  const ws = new WebSocket('ws://localhost:3001/admin/tickets');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'TICKET_STATUS_CHANGED') {
      updateTicketInList(data.ticketId, { status: data.newStatus });
    }
    
    if (data.type === 'TICKET_CHECKED_IN') {
      updateTicketInList(data.ticketId, { 
        checkInStatus: 'checked_in',
        checkedInAt: data.timestamp 
      });
    }
  };
  
  return () => ws.close();
}, []);
```

### Update Strategy
- **Optimistic Updates**: Immediately update UI on action
- **WebSocket Confirmation**: Revert if server rejects
- **Real-time Sync**: Update tickets changed by other admins/scanners

---

## 🎨 UI/UX Highlights

### Status Badges
Two separate badge columns for clarity:
- **Ticket Status**: Green (Valid), Red (Cancelled), Purple (Refunded), Gray (Used)
- **Check-In Status**: Amber (Not Checked In), Green (Checked In)

### Filter UX
- Badge on filter button shows active count
- Chips display active filters with X to remove
- "Clear all" link for quick reset
- Modal remembers values until applied

### Loading States
- **Initial Load**: Spinner in table center
- **Load More**: Button shows spinner + "Loading..."
- **Refresh**: Icon spins on refresh button

### Empty States
- **No Tickets**: Large icon + helpful message
- **No Results**: Suggests adjusting filters + quick clear action

---

## 🚀 Next Steps

1. **WebSocket Server Setup**
   - Create `/admin/tickets` WebSocket endpoint
   - Emit events on status changes and check-ins
   - Authenticate admin connections

2. **Virtual Scrolling**
   - Install `react-window` or `react-virtualized`
   - Implement windowed list for 1000+ tickets
   - Maintain scroll position on updates

3. **Advanced Features**
   - Bulk actions (select multiple tickets)
   - CSV export
   - Ticket transfer UI
   - Audit log viewer

4. **Testing**
   - Load test with 10K+ tickets
   - Test concurrent admin actions
   - Verify WebSocket reconnection
   - Mobile responsiveness

---

*Implementation completed: 2024-02-04*
