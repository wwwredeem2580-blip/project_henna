export default (filters: any) => {
    let sortOptions: any = { createdAt: -1 }; // Default sort
    
    if (filters.sortBy) {
      const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
      
      switch (filters.sortBy) {
        case 'date':
          sortOptions = { 'schedule.startDate': sortOrder };
          break;
        case 'revenue':
          sortOptions = { 'metrics.revenue': sortOrder };
          break;
        case 'tickets_sold':
          sortOptions = { 'metrics.ticketsSold': sortOrder };
          break;
        case 'conversion_rate':
          sortOptions = { 'metrics.conversionRate': sortOrder };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }
    }
    return sortOptions;
}