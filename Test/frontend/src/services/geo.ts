import api from './api';

export interface GeoResponse {
  city: string;
  country: string;
}

export const reverseGeocode = async (lat: number, lon: number): Promise<GeoResponse> => {
  const response = await api.get<GeoResponse>('/geo/reverse', {
    params: { lat, lon }
  });
  return response.data;
};