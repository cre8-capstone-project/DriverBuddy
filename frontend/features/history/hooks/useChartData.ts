export const useChartData = (viewMode: string) => {
  // TODO:
  // This part will be replaced by fetching data through APIs
  // Now, it generates dummy data for sandbox
  return Array.from(
    {length: viewMode === 'week' ? 7 : viewMode === 'month' ? 30 : 12},
    (_, index) => ({
      id: index + 1,
      hours: Math.floor(Math.random() * (100 - 50 + 1)) + 50,
      alerts: Math.floor(Math.random() * 30),
    }),
  );
};
