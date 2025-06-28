import { useQuery } from '@tanstack/react-query';
import { CENSUS_BASE } from '@/constants/Api';

interface CensusResponse {
  result: {
    addressMatches: Array<{
      coordinates: {
        x: number;
        y: number;
      };
    }>;
  };
}

export const useGeocode = (address?: string) => {
  return useQuery({
    enabled: !!address,
    queryKey: ['geocode', address],
    queryFn: async () => {
      const url = `${CENSUS_BASE}?address=${encodeURIComponent(
        address!
      )}&benchmark=Public_AR_Current&format=json`;
      const res = await fetch(url);
      const data = (await res.json()) as CensusResponse;
      const match = data.result.addressMatches?.[0]?.coordinates;
      if (!match) throw new Error('Address not found');
      return { lon: match.x, lat: match.y };
    },
  });
};