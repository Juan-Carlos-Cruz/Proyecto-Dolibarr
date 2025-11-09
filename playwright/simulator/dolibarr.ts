import { bomSeeds, productSeeds, type ProductSeed, segmentMatrix } from '../fixtures/test-data';

export type ModuleName =
  | 'Products/Services'
  | 'Bill of Materials'
  | 'Stock'
  | 'Attributes & Variants'
  | 'Third parties'
  | 'Sales orders';

type ProductStatus = 'ACTIVE' | 'DISABLED';

type MovementType = 'in' | 'out' | 'transfer';

type ShipmentStatus = 'DRAFT' | 'SHIPPED';

interface DocumentRecord {
  name: string;
  category: string;
  content: string;
}

interface PriceHistoryEntry {
  basePrice: number;
  minPrice: number;
  vatRate: number;
  timestamp: number;
  user: string;
  status: 'saved' | 'warning' | 'error';
  message: string;
}

interface ProductRecord extends ProductSeed {
  status: ProductStatus;
  documents: DocumentRecord[];
  segmentPrices: Map<number, number>;
  history: PriceHistoryEntry[];
}

interface MovementRecord {
  warehouse: string;
  reference: string;
  quantity: number;
  reason: string;
  type: MovementType;
  timestamp: number;
}

interface WarehouseRecord {
  name: string;
  stock: Map<string, number>;
}

interface BomLine {
  reference: string;
  quantity: number;
  type: 'product' | 'service';
}

interface BomRecord {
  reference: string;
  label: string;
  status: 'DRAFT' | 'VALIDATED';
  lines: BomLine[];
}

interface ShipmentRecord {
  id: number;
  reference: string;
  quantity: number;
  status: ShipmentStatus;
}

interface OrderRecord {
  id: number;
  customer: string;
  segment: number;
  lines: Array<{ reference: string; price: number; segment: number }>;
}

export class DolibarrApp {
  private readonly modules = new Set<ModuleName>();
  private readonly products = new Map<string, ProductRecord>();
  private readonly warehouses = new Map<string, WarehouseRecord>();
  private readonly movements: MovementRecord[] = [];
  private readonly boms = new Map<string, BomRecord>();
  private readonly attributes = new Map<string, string[]>();
  private readonly variants = new Map<string, Set<string>>();
  private readonly thirdParties = new Map<string, number>();
  private readonly orders = new Map<number, OrderRecord>();
  private readonly shipments = new Map<number, ShipmentRecord>();
  private nextOrderId = 1;
  private nextShipmentId = 1;

  constructor(initialSeeds: ProductSeed[] = productSeeds) {
    this.warehouses.set('Central', { name: 'Central', stock: new Map() });
    this.warehouses.set('Secundario', { name: 'Secundario', stock: new Map() });
    for (const seed of initialSeeds) {
      this.createProduct(seed);
    }
  }

  public activateModule(name: ModuleName): void {
    this.modules.add(name);
  }

  public isModuleActive(name: ModuleName): boolean {
    return this.modules.has(name);
  }

  public listActiveModules(): ModuleName[] {
    return Array.from(this.modules.values());
  }

  public createProduct(seed: ProductSeed): ProductRecord {
    if (!seed.label.trim()) {
      throw new Error('Label is required');
    }
    if (!seed.reference.trim()) {
      throw new Error('Reference is required');
    }
    if (this.products.has(seed.reference)) {
      throw new Error(`Product ${seed.reference} already exists`);
    }
    const record: ProductRecord = {
      ...seed,
      status: 'ACTIVE',
      documents: [],
      segmentPrices: new Map<number, number>(),
      history: [],
    };
    this.products.set(seed.reference, record);
    return this.cloneProduct(record);
  }

  public disableProduct(reference: string): void {
    const product = this.products.get(reference);
    if (!product) {
      throw new Error(`Product ${reference} not found`);
    }
    product.status = 'DISABLED';
  }

  public getProduct(reference: string): ProductRecord {
    const product = this.products.get(reference);
    if (!product) {
      throw new Error(`Product ${reference} not found`);
    }
    return this.cloneProduct(product);
  }

  public listProducts(options: { labelContains?: string; order?: 'ASC' | 'DESC'; type?: 'product' | 'service' } = {}): ProductRecord[] {
    const { labelContains, order = 'ASC', type } = options;
    let records = Array.from(this.products.values());
    if (labelContains) {
      const normalized = labelContains.toLowerCase();
      records = records.filter((record) => record.label.toLowerCase().includes(normalized));
    }
    if (type) {
      records = records.filter((record) => record.type === type);
    }
    records.sort((a, b) => {
      return order === 'ASC' ? a.reference.localeCompare(b.reference) : b.reference.localeCompare(a.reference);
    });
    return records.map((record) => this.cloneProduct(record));
  }

  public attachDocuments(reference: string, documents: DocumentRecord[]): void {
    const product = this.products.get(reference);
    if (!product) {
      throw new Error(`Product ${reference} not found`);
    }
    for (const doc of documents) {
      product.documents.push({ ...doc });
    }
  }

  public getProductDocuments(reference: string): DocumentRecord[] {
    const product = this.products.get(reference);
    if (!product) {
      throw new Error(`Product ${reference} not found`);
    }
    return product.documents.map((doc) => ({ ...doc }));
  }

  public registerMovement(params: {
    warehouse: string;
    targetWarehouse?: string;
    reference: string;
    quantity: number;
    reason: string;
    type: MovementType;
  }): MovementRecord {
    const { warehouse, targetWarehouse = 'Secundario', reference, quantity, reason, type } = params;
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    const source = this.requireWarehouse(warehouse);
    const target = this.requireWarehouse(targetWarehouse);
    const product = this.products.get(reference);
    if (!product) {
      throw new Error(`Product ${reference} not found`);
    }

    if (type === 'out' || type === 'transfer') {
      const available = source.stock.get(reference) ?? 0;
      if (available < quantity) {
        throw new Error('Insufficient stock');
      }
      source.stock.set(reference, available - quantity);
    }

    if (type === 'in') {
      const current = source.stock.get(reference) ?? 0;
      source.stock.set(reference, current + quantity);
    } else if (type === 'transfer') {
      const targetQty = target.stock.get(reference) ?? 0;
      target.stock.set(reference, targetQty + quantity);
    }

    const movement: MovementRecord = {
      warehouse,
      reference,
      quantity,
      reason,
      type,
      timestamp: Date.now(),
    };
    this.movements.push(movement);
    return movement;
  }

  public getMovements(): MovementRecord[] {
    return this.movements.map((movement) => ({ ...movement }));
  }

  public getWarehouseSnapshot(warehouse: string): Array<{ reference: string; quantity: number }> {
    const store = this.requireWarehouse(warehouse).stock;
    return Array.from(store.entries()).map(([reference, quantity]) => ({ reference, quantity }));
  }

  public createBom(reference: string, label: string): BomRecord {
    if (this.boms.has(reference)) {
      throw new Error(`BOM ${reference} already exists`);
    }
    const record: BomRecord = { reference, label, status: 'DRAFT', lines: [] };
    this.boms.set(reference, record);
    return this.cloneBom(record);
  }

  public addBomLine(bomReference: string, line: BomLine): BomRecord {
    if (line.quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }
    const bom = this.boms.get(bomReference);
    if (!bom) {
      throw new Error(`BOM ${bomReference} not found`);
    }
    bom.lines.push({ ...line });
    return this.cloneBom(bom);
  }

  public validateBom(bomReference: string): BomRecord {
    const bom = this.boms.get(bomReference);
    if (!bom) {
      throw new Error(`BOM ${bomReference} not found`);
    }
    bom.status = 'VALIDATED';
    return this.cloneBom(bom);
  }

  public generateBomReportName(bomReference: string): string {
    return `${bomReference}.odt`;
  }

  public registerAttribute(name: string, values: string[]): void {
    this.attributes.set(name, [...values]);
  }

  public generateVariants(reference: string): number {
    const attributeSets = Array.from(this.attributes.values());
    if (attributeSets.length === 0) {
      return 0;
    }
    const combinations = this.cartesian(attributeSets);
    this.variants.set(reference, new Set(combinations.map((combo) => combo.join('|'))));
    return combinations.length;
  }

  public listVariants(reference: string): string[] {
    const variants = this.variants.get(reference);
    if (!variants) {
      return [];
    }
    return Array.from(variants.values());
  }

  public updatePricing(reference: string, params: { basePrice: number; minPrice: number; vatRate: number }): PriceHistoryEntry {
    const product = this.products.get(reference);
    if (!product) {
      throw new Error(`Product ${reference} not found`);
    }
    let status: PriceHistoryEntry['status'] = 'saved';
    let message = 'Updated';
    if (params.basePrice < params.minPrice) {
      status = 'error';
      message = 'Minimum price rule violated';
    } else if (params.vatRate > 0.21) {
      status = 'warning';
      message = 'VAT out of range';
    }
    const entry: PriceHistoryEntry = {
      basePrice: params.basePrice,
      minPrice: params.minPrice,
      vatRate: params.vatRate,
      timestamp: Date.now(),
      user: 'admin',
      status,
      message,
    };
    product.history.push(entry);
    product.basePrice = params.basePrice;
    product.minPrice = params.minPrice;
    product.vatRate = params.vatRate;
    return entry;
  }

  public getPricingHistory(reference: string): PriceHistoryEntry[] {
    const product = this.products.get(reference);
    if (!product) {
      throw new Error(`Product ${reference} not found`);
    }
    return product.history.map((entry) => ({ ...entry }));
  }

  public setSegmentPrice(reference: string, segment: number, price: number): void {
    const product = this.products.get(reference);
    if (!product) {
      throw new Error(`Product ${reference} not found`);
    }
    product.segmentPrices.set(segment, price);
  }

  public getSegmentPrice(reference: string, segment: number): number {
    const product = this.products.get(reference);
    if (!product) {
      throw new Error(`Product ${reference} not found`);
    }
    return product.segmentPrices.get(segment) ?? product.basePrice;
  }

  public createThirdParty(name: string, segment: number): void {
    if (!segmentMatrix.includes(segment)) {
      throw new Error(`Segment ${segment} is not configured`);
    }
    this.thirdParties.set(name, segment);
  }

  public createSalesOrder(customer: string): OrderRecord {
    const segment = this.thirdParties.get(customer);
    if (segment === undefined) {
      throw new Error(`Customer ${customer} not registered`);
    }
    const order: OrderRecord = { id: this.nextOrderId++, customer, segment, lines: [] };
    this.orders.set(order.id, order);
    return this.cloneOrder(order);
  }

  public addOrderLine(orderId: number, reference: string, quantity: number): OrderRecord {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    const price = this.getSegmentPrice(reference, order.segment);
    order.lines.push({ reference, price: price * quantity, segment: order.segment });
    return this.cloneOrder(order);
  }

  public getOrder(orderId: number): OrderRecord {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    return this.cloneOrder(order);
  }

  public createShipment(reference: string, quantity: number): ShipmentRecord {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    const product = this.products.get(reference);
    if (!product) {
      throw new Error(`Product ${reference} not found`);
    }
    if (product.type !== 'product') {
      throw new Error('Only physical products can be shipped');
    }
    const stock = this.requireWarehouse('Central').stock;
    const available = stock.get(reference) ?? 0;
    if (available < quantity) {
      throw new Error('Insufficient stock for shipment');
    }
    stock.set(reference, available - quantity);
    const shipment: ShipmentRecord = {
      id: this.nextShipmentId++,
      reference,
      quantity,
      status: 'SHIPPED',
    };
    this.shipments.set(shipment.id, shipment);
    return { ...shipment };
  }

  public getShipment(id: number): ShipmentRecord {
    const shipment = this.shipments.get(id);
    if (!shipment) {
      throw new Error(`Shipment ${id} not found`);
    }
    return { ...shipment };
  }

  public getStockVisibility(): { included: string[]; excluded: string[] } {
    const included: string[] = [];
    const excluded: string[] = [];
    for (const product of this.products.values()) {
      if (product.type === 'product') {
        included.push(product.label);
      } else {
        excluded.push(product.label);
      }
    }
    return { included, excluded };
  }

  public seedBomFixtures(): void {
    for (const bom of bomSeeds) {
      const record = this.createBom(bom.reference, bom.label);
      for (const line of bom.lines) {
        this.addBomLine(record.reference, line);
      }
    }
  }

  private requireWarehouse(name: string): WarehouseRecord {
    const warehouse = this.warehouses.get(name);
    if (!warehouse) {
      throw new Error(`Warehouse ${name} not found`);
    }
    return warehouse;
  }

  private cartesian(sets: string[][]): string[][] {
    return sets.reduce<string[][]>(
      (accumulator, set) => {
        const results: string[][] = [];
        for (const prefix of accumulator) {
          for (const value of set) {
            results.push([...prefix, value]);
          }
        }
        return results;
      },
      [[]]
    );
  }

  private cloneProduct(record: ProductRecord): ProductRecord {
    return {
      ...record,
      documents: record.documents.map((doc) => ({ ...doc })),
      segmentPrices: new Map(record.segmentPrices),
      history: record.history.map((entry) => ({ ...entry })),
    };
  }

  private cloneBom(record: BomRecord): BomRecord {
    return {
      ...record,
      lines: record.lines.map((line) => ({ ...line })),
    };
  }

  private cloneOrder(record: OrderRecord): OrderRecord {
    return {
      ...record,
      lines: record.lines.map((line) => ({ ...line })),
    };
  }
}

export function createDolibarrApp(): DolibarrApp {
  const app = new DolibarrApp();
  app.activateModule('Products/Services');
  app.activateModule('Bill of Materials');
  app.activateModule('Stock');
  app.activateModule('Attributes & Variants');
  app.activateModule('Third parties');
  app.activateModule('Sales orders');
  return app;
}
