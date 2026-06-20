import mongoose, { Model, Document, QueryFilter, UpdateQuery, QueryOptions } from 'mongoose';

export class TenantService {
  private tenantId: mongoose.Types.ObjectId;

  constructor(tenantId: string | mongoose.Types.ObjectId) {
    if (!tenantId) {
      throw new Error('Tenant ID is required for TenantService operations');
    }
    this.tenantId = typeof tenantId === 'string' ? new mongoose.Types.ObjectId(tenantId) : tenantId;
  }

  getTenantId(): mongoose.Types.ObjectId {
    return this.tenantId;
  }

  // Inject tenantId filter to query
  private injectTenantFilter<T>(query: QueryFilter<T> = {}): QueryFilter<T> {
    return { ...query, tenantId: this.tenantId };
  }

  // Inject tenantId to doc/payload for insertion
  private injectTenantData(doc: any): any {
    return { ...doc, tenantId: this.tenantId };
  }

  // Find operations
  async find<T extends Document>(
    model: Model<T>,
    filter: QueryFilter<T> = {},
    projection?: any,
    options?: QueryOptions
  ): Promise<T[]> {
    return model.find(this.injectTenantFilter(filter), projection, options);
  }

  async findOne<T extends Document>(
    model: Model<T>,
    filter: QueryFilter<T> = {},
    projection?: any,
    options?: QueryOptions
  ): Promise<T | null> {
    return model.findOne(this.injectTenantFilter(filter), projection, options);
  }

  async findById<T extends Document>(
    model: Model<T>,
    id: string | mongoose.Types.ObjectId,
    projection?: any,
    options?: QueryOptions
  ): Promise<T | null> {
    return model.findOne(this.injectTenantFilter({ _id: id } as any), projection, options);
  }

  // Create operations
  async create<T extends Document>(model: Model<T>, doc: Partial<T> | any): Promise<T> {
    const data = this.injectTenantData(doc);
    return model.create(data);
  }

  async insertMany<T extends Document>(model: Model<T>, docs: any[], options?: any): Promise<T[]> {
    const data = docs.map((d) => this.injectTenantData(d));
    return model.insertMany(data, options) as unknown as Promise<T[]>;
  }

  // Update operations
  async updateOne<T extends Document>(
    model: Model<T>,
    filter: QueryFilter<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions
  ) {
    return model.updateOne(this.injectTenantFilter(filter), update, options as any);
  }

  async updateMany<T extends Document>(
    model: Model<T>,
    filter: QueryFilter<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions
  ) {
    return model.updateMany(this.injectTenantFilter(filter), update, options as any);
  }

  async findOneAndUpdate<T extends Document>(
    model: Model<T>,
    filter: QueryFilter<T>,
    update: UpdateQuery<T>,
    options: QueryOptions = {}
  ): Promise<T | null> {
    return model.findOneAndUpdate(this.injectTenantFilter(filter), update, { ...options, new: true });
  }

  // Delete operations
  async deleteOne<T extends Document>(model: Model<T>, filter: QueryFilter<T>, options?: QueryOptions) {
    return model.deleteOne(this.injectTenantFilter(filter), options as any);
  }

  async deleteMany<T extends Document>(model: Model<T>, filter: QueryFilter<T>, options?: QueryOptions) {
    return model.deleteMany(this.injectTenantFilter(filter), options as any);
  }

  async countDocuments<T extends Document>(model: Model<T>, filter: QueryFilter<T> = {}): Promise<number> {
    return model.countDocuments(this.injectTenantFilter(filter));
  }
}
