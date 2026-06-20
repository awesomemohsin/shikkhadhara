import mongoose, { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';

export class TenantQuery {
  // Validate that a tenantId is present, otherwise throw a Security Violation
  private static validateTenantId(tenantId: any): void {
    if (!tenantId) {
      throw new Error('Security Violation: A tenantId is required for this operation');
    }
  }

  // Inject tenantId filter to query
  static injectTenantFilter<T>(
    tenantId: string | mongoose.Types.ObjectId,
    filter: FilterQuery<T> = {}
  ): FilterQuery<T> {
    this.validateTenantId(tenantId);
    const tId = typeof tenantId === 'string' ? new mongoose.Types.ObjectId(tenantId) : tenantId;
    return { ...filter, tenantId: tId };
  }

  // Inject tenantId to doc/payload for insertion
  static injectTenantData(tenantId: string | mongoose.Types.ObjectId, doc: any): any {
    this.validateTenantId(tenantId);
    const tId = typeof tenantId === 'string' ? new mongoose.Types.ObjectId(tenantId) : tenantId;
    return { ...doc, tenantId: tId };
  }

  // Find operations
  static async find<T extends Document>(
    model: Model<T>,
    tenantId: string | mongoose.Types.ObjectId,
    filter: FilterQuery<T> = {},
    projection?: any,
    options?: QueryOptions
  ): Promise<T[]> {
    this.validateTenantId(tenantId);
    return model.find(this.injectTenantFilter(tenantId, filter), projection, options);
  }

  static async findOne<T extends Document>(
    model: Model<T>,
    tenantId: string | mongoose.Types.ObjectId,
    filter: FilterQuery<T> = {},
    projection?: any,
    options?: QueryOptions
  ): Promise<T | null> {
    this.validateTenantId(tenantId);
    return model.findOne(this.injectTenantFilter(tenantId, filter), projection, options);
  }

  static async findById<T extends Document>(
    model: Model<T>,
    tenantId: string | mongoose.Types.ObjectId,
    id: string | mongoose.Types.ObjectId,
    projection?: any,
    options?: QueryOptions
  ): Promise<T | null> {
    this.validateTenantId(tenantId);
    return model.findOne(this.injectTenantFilter(tenantId, { _id: id } as any), projection, options);
  }

  // Create operations
  static async create<T extends Document>(
    model: Model<T>,
    tenantId: string | mongoose.Types.ObjectId,
    doc: Partial<T> | any
  ): Promise<T> {
    this.validateTenantId(tenantId);
    const data = this.injectTenantData(tenantId, doc);
    return model.create(data);
  }

  static async insertMany<T extends Document>(
    model: Model<T>,
    tenantId: string | mongoose.Types.ObjectId,
    docs: any[],
    options?: any
  ): Promise<T[]> {
    this.validateTenantId(tenantId);
    const data = docs.map((d) => this.injectTenantData(tenantId, d));
    return model.insertMany(data, options);
  }

  // Update operations
  static async updateOne<T extends Document>(
    model: Model<T>,
    tenantId: string | mongoose.Types.ObjectId,
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions
  ) {
    this.validateTenantId(tenantId);
    return model.updateOne(this.injectTenantFilter(tenantId, filter), update, options);
  }

  static async updateMany<T extends Document>(
    model: Model<T>,
    tenantId: string | mongoose.Types.ObjectId,
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions
  ) {
    this.validateTenantId(tenantId);
    return model.updateMany(this.injectTenantFilter(tenantId, filter), update, options);
  }

  static async findOneAndUpdate<T extends Document>(
    model: Model<T>,
    tenantId: string | mongoose.Types.ObjectId,
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options: QueryOptions = {}
  ): Promise<T | null> {
    this.validateTenantId(tenantId);
    return model.findOneAndUpdate(this.injectTenantFilter(tenantId, filter), update, {
      ...options,
      new: true,
    });
  }

  // Delete operations
  static async deleteOne<T extends Document>(
    model: Model<T>,
    tenantId: string | mongoose.Types.ObjectId,
    filter: FilterQuery<T>,
    options?: QueryOptions
  ) {
    this.validateTenantId(tenantId);
    return model.deleteOne(this.injectTenantFilter(tenantId, filter), options);
  }

  static async deleteMany<T extends Document>(
    model: Model<T>,
    tenantId: string | mongoose.Types.ObjectId,
    filter: FilterQuery<T>,
    options?: QueryOptions
  ) {
    this.validateTenantId(tenantId);
    return model.deleteMany(this.injectTenantFilter(tenantId, filter), options);
  }

  static async countDocuments<T extends Document>(
    model: Model<T>,
    tenantId: string | mongoose.Types.ObjectId,
    filter: FilterQuery<T> = {}
  ): Promise<number> {
    this.validateTenantId(tenantId);
    return model.countDocuments(this.injectTenantFilter(tenantId, filter));
  }
}
