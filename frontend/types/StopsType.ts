export type StopsType = {
  stopId?: number;
  journeyId: string;
  latitude: number;
  longitude: number;
  address: string;
  name: string;
  priceLevel: number | null;
  rating: number | null;
  isOrigin: boolean | null;
  isDestination: boolean | null;
};
