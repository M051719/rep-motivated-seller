// Property types
export interface Property {
  id: string;
  userId: string;
  address: string;
  propertyType: 'single-family' | 'multi-family' | 'condo' | 'townhouse' | 'land';
  analysisType: 'flip' | 'rental' | 'wholesale';
  analysisData: any;
  createdAt: string;
  updatedAt: string;
}
