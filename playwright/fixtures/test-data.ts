export interface ProductSeed {
  reference: string;
  label: string;
  type: 'product' | 'service';
  weight: number;
  size: string;
  hts: string;
  basePrice: number;
  minPrice: number;
  vatRate: number;
  segment?: number;
}

export const productSeeds: ProductSeed[] = Array.from({ length: 50 }).map((_, index) => {
  const numericRef = (index + 1).toString().padStart(7, '0');
  const isService = (index + 1) % 5 === 0;

  return {
    reference: `PROD-${numericRef}`,
    label: `${isService ? 'Servicio' : 'Producto'} QA ${index + 1}`,
    type: isService ? 'service' : 'product',
    weight: Math.max(0.1, (index % 10) * 0.5),
    size: `${10 + index}x${8 + index}x${5 + (index % 3)}`,
    hts: `1234.${(index % 90).toString().padStart(2, '0')}.${(index % 99)
      .toString()
      .padStart(2, '0')}`,
    basePrice: 50 + index * 3,
    minPrice: 45 + index * 2,
    vatRate: index % 3 === 0 ? 0 : index % 3 === 1 ? 0.05 : 0.19,
    segment: (index % 5) + 1
  };
});

export const bomSeeds = [
  {
    reference: 'BOM-QA-001',
    label: 'Kit producto QA 1',
    status: 'DRAFT',
    lines: [
      { reference: 'PROD-0000001', quantity: 2, type: 'product' as const },
      { reference: 'PROD-0000005', quantity: 1, type: 'product' as const }
    ]
  },
  {
    reference: 'BOM-QA-002',
    label: 'Kit servicio QA',
    status: 'DRAFT',
    lines: [
      { reference: 'PROD-0000002', quantity: 1, type: 'service' as const },
      { reference: 'PROD-0000003', quantity: 3, type: 'product' as const }
    ]
  }
];

export const segmentMatrix = [1, 2, 3, 4, 5];
