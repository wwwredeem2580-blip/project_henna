export default (hostId: string, filters: any) => {
  const query: any = { hostId };
      
  // Filter by status
  if (filters.status) {
    switch (filters.status) {
      case 'published':
        query.status = 'published';
        break;
      case 'live':
        query.status = 'live';
        break;
      case 'ended':
        query.status = 'ended';
        break;
      case 'cancelled':
        query.status = 'cancelled';
        break;
      case 'draft':
        query.status = 'draft';
        break;
      case 'pending_approval':
        query.status = 'pending_approval';
        break;
      case 'approved':
        query.status = 'approved';
        break;
      case 'rejected':
        query.status = 'rejected';
        break;
    }
  }
  
  // Filter by date range
  if (filters.dateRange?.start || filters.dateRange?.end) {
    const dateFilter: any = {};
    if (filters.dateRange?.start) {
      dateFilter.$gte = new Date(filters.dateRange.start);
    }
    if (filters.dateRange?.end) {
      dateFilter.$lte = new Date(filters.dateRange.end);
    }
    query['schedule.startDate'] = dateFilter;
  }
  
  // Filter by search
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { 'venue.name': { $regex: filters.search, $options: 'i' } }
    ];
  }

  return query;
}