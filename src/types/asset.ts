export interface Asset {
  id?: string;
  assetId?: string; // Combined BIM/Asset ID
  name: string;
  system: string;
  subSystem: string;
  floor: string;
  purchaseDate: string;
  value: number;
  condition: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  notes?: string;
}