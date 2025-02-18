type viewMode = 'day' | 'week' | 'month' | 'year';

export const useChartData = (viewMode: viewMode, startDate: Date) => {
  // TODO:
  // This part will be replaced by fetching data through APIs
  // Now, it generates dummy data for sandbox

  const maxHoursValues = {
    day: 15,
    week: 15,
    month: 15,
    year: 300,
  };

  const maxAlertValues = {
    day: 5,
    week: 5,
    month: 5,
    year: 100,
  };

  const maxHours = maxHoursValues[viewMode] || 0;
  const maxAlerts = maxAlertValues[viewMode] || 0;

  return Array.from(
    {length: viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : viewMode === 'month' ? 30 : 12},
    (_, index) => ({
      id: index + 1,
      hours: Math.floor(Math.random() * maxHours),
      alerts: Math.floor(Math.random() * maxAlerts),
    }),
  );
};
