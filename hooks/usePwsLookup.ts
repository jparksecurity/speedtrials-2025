import { useQuery } from '@tanstack/react-query';
import { ARCGIS_BASE } from '@/constants/Api';

interface ArcGISResponse {
  features: Array<{
    attributes: {
      PWSID: string;
      PWS_Name: string;
      Primacy_Agency: string;
    };
  }>;
}

interface PwsResult {
  pwsid: string;
  name: string;
  primacyAgency: string;
}

export const usePwsLookup = (coordinates?: { lat: number; lon: number }) => {
  return useQuery({
    enabled: !!coordinates,
    queryKey: ['pws-lookup', coordinates],
    queryFn: async (): Promise<PwsResult> => {
      const { lat, lon } = coordinates!;
      const params = new URLSearchParams({
        where: '1=1',
        geometry: `${lon},${lat}`,
        geometryType: 'esriGeometryPoint',
        inSR: '4326',
        spatialRel: 'esriSpatialRelIntersects',
        outFields: 'PWSID,PWS_Name,Primacy_Agency',
        returnGeometry: 'false',
        f: 'json',
      });
      
      const url = `${ARCGIS_BASE}?${params}`;
      const res = await fetch(url);
      const data = (await res.json()) as ArcGISResponse;
      
      if (!data.features || data.features.length === 0) {
        throw new Error('No PWS boundary found for this location');
      }
      
      const feature = data.features[0];
      return {
        pwsid: feature.attributes.PWSID,
        name: feature.attributes.PWS_Name,
        primacyAgency: feature.attributes.Primacy_Agency,
      };
    },
  });
};