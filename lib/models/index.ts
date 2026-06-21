import mongoose from 'mongoose';

// Tenant Schema
const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subdomain: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  domain: { type: String, unique: true, sparse: true, index: true },
  type: { type: String, enum: ['school', 'madrasa', 'college'], required: true },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  email: { type: String, required: true, unique: true },
  phone: String,
  address: String,
  city: String,
  country: String,
  logo: String,
  featureFlags: {
    hifz: { type: Boolean, default: false },
    finance: { type: Boolean, default: true },
    attendance: { type: Boolean, default: true },
    academics: { type: Boolean, default: true },
    hrPayroll: { type: Boolean, default: true },
  },
  settings: {
    theme: { type: String, default: 'light' },
    primaryColor: { type: String, default: '#3b82f6' },
    timezone: { type: String, default: 'Asia/Dhaka' },
    currency: { type: String, default: 'BDT' },
    language: { type: String, default: 'en' },
  },
  subscription: {
    plan: { type: String, enum: ['free', 'basic', 'professional', 'enterprise'], default: 'free' },
    status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' },
    startDate: Date,
    endDate: Date,
    studentsLimit: { type: Number, default: 100 },
    staffLimit: { type: Number, default: 20 },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// User Schema
const userSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  phone: String,
  profileImage: String,
  role: { type: String, enum: ['owner', 'super_admin', 'admin', 'teacher', 'student', 'parent', 'staff'], required: true },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  lastLogin: Date,
  emailVerified: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Student Schema
const studentSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  enrollmentId: { type: String, unique: true, sparse: true },
  admissionNo: String,
  admissionDate: Date,
  firstName: { type: String, required: true },
  lastName: String,
  email: String,
  phone: String,
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  bloodGroup: String,
  category: String,
  religion: String,
  caste: String,
  mobileNumber: String,
  nidNo: String,
  house: String,
  height: Number,
  weight: Number,

  // Address Details
  address: String,
  city: String,
  state: String,
  pincode: String,
  country: String,

  // Parent/Guardian Info
  fatherName: String,
  fatherPhone: String,
  fatherOccupation: String,
  motherName: String,
  motherPhone: String,
  motherOccupation: String,
  guardianName: String,
  guardianPhone: String,
  guardianEmail: String,
  guardianOccupation: String,
  guardianAddress: String,
  relationWithStudent: String,
  fatherNidNo: String,
  motherNidNo: String,

  // Uploaded Files (paths)
  studentPhoto: String,
  fatherPhoto: String,
  motherPhoto: String,
  guardianPhoto: String,
  studentNidCard: String,
  fatherNidCard: String,
  motherNidCard: String,
  birthCertificate: String,

  class: { type: String, required: true },
  section: String,
  subjectGroup: String,
  rollNumber: String,
  joinDate: { type: Date, default: Date.now },
  isSpecialChild: { type: Boolean, default: false },
  discountPercentage: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'graduated', 'transferred'], default: 'active' },
  profileImage: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


// Teacher Schema
const teacherSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employeeId: { type: String, unique: true, sparse: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: String,
  phone: String,
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  address: String,
  qualification: String,
  specialization: String,
  joinDate: { type: Date, default: Date.now },
  assignedClasses: [String],
  subjects: [String],
  salary: Number,
  salaryFrequency: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
  position: { type: String, enum: ['teacher', 'senior_teacher', 'headmaster', 'associate_headmaster', 'other'], default: 'teacher' },
  status: { type: String, enum: ['active', 'inactive', 'on_leave', 'suspended'], default: 'active' },
  profileImage: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Staff Schema
const staffSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employeeId: { type: String, unique: true, sparse: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: String,
  phone: String,
  position: { type: String, required: true },
  department: String,
  joinDate: { type: Date, default: Date.now },
  salary: Number,
  salaryFrequency: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
  status: { type: String, enum: ['active', 'inactive', 'on_leave', 'suspended'], default: 'active' },
  profileImage: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Parent Schema
const parentSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: String,
  phone: String,
  relationship: String,
  occupation: String,
  childrenIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  profileImage: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  class: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
  remarks: String,
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Exam Schema
const examSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  class: { type: String, required: true },
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  totalMarks: { type: Number, required: true },
  passingMarks: { type: Number, required: true },
  duration: Number,
  description: String,
  status: { type: String, enum: ['scheduled', 'ongoing', 'completed'], default: 'scheduled' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Exam Result Schema
const examResultSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  marksObtained: { type: Number, required: true },
  percentage: Number,
  grade: String,
  status: { type: String, enum: ['pass', 'fail'], default: 'pass' },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Fee Schema
const feeSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  feeType: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  paidDate: Date,
  status: { type: String, enum: ['pending', 'partial', 'paid', 'overdue'], default: 'pending' },
  amountPaid: { type: Number, default: 0 },
  paymentMethod: String,
  description: String,
  month: String,
  year: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Payment Schema
const paymentSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  feeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fee', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'card', 'bank_transfer', 'bkash', 'nagad', 'ssl_commerz'], required: true },
  transactionId: { type: String, unique: true, sparse: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  paymentDate: { type: Date, default: Date.now },
  notes: String,
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Notification Schema
const notificationSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipientRole: String,
  type: { type: String, enum: ['sms', 'whatsapp', 'email', 'in_app'], required: true },
  title: String,
  message: { type: String, required: true },
  relatedId: mongoose.Schema.Types.ObjectId,
  relatedType: String,
  status: { type: String, enum: ['pending', 'sent', 'failed', 'read'], default: 'pending' },
  sentAt: Date,
  readAt: Date,
  retryCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// SMS Gateway Log Schema
const smsLogSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  phoneNumber: { type: String, required: true },
  message: { type: String, required: true },
  provider: { type: String, default: 'mock' },
  status: { type: String, enum: ['sent', 'failed', 'pending'], default: 'pending' },
  messageId: String,
  createdAt: { type: Date, default: Date.now },
});

// WhatsApp Gateway Log Schema
const whatsappLogSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  phoneNumber: { type: String, required: true },
  message: { type: String, required: true },
  provider: { type: String, default: 'mock' },
  status: { type: String, enum: ['sent', 'failed', 'pending'], default: 'pending' },
  messageId: String,
  createdAt: { type: Date, default: Date.now },
});

// Billing Invoice Schema
const invoiceSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  invoiceNumber: { type: String, unique: true, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  feeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fee' }],
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  netAmount: Number,
  issueDate: { type: Date, default: Date.now },
  dueDate: Date,
  status: { type: String, enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'], default: 'draft' },
  paymentHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Report Schema
const reportSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['attendance', 'academics', 'fees', 'student', 'staff'], required: true },
  filters: mongoose.Schema.Types.Mixed,
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  data: mongoose.Schema.Types.Mixed,
  format: { type: String, enum: ['pdf', 'excel', 'csv'], default: 'pdf' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Salary Schema
const salarySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, refPath: 'employeeType', required: true },
  employeeType: { type: String, required: true, enum: ['Teacher', 'Staff'] },
  basicSalary: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  paymentMonth: { type: String, required: true },
  paymentYear: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'bank_transfer', 'bkash', 'nagad'], default: 'cash' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Inventory/Stock Schema
const inventorySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  itemName: { type: String, required: true },
  category: { type: String },
  quantity: { type: Number, default: 0 },
  unit: { type: String, default: 'pcs' },
  status: { type: String, enum: ['in_stock', 'low_stock', 'out_of_stock'], default: 'in_stock' },
  supplier: { type: String },
  lastRestocked: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hostel Schema
const hostelSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['boys', 'girls', 'coed'], required: true },
  address: { type: String },
  capacity: { type: Number },
  rooms: [{
    roomNumber: { type: String, required: true },
    capacity: { type: Number, required: true },
    occupied: { type: Number, default: 0 },
    type: { type: String, enum: ['single', 'double', 'dorm'], default: 'double' }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Gallery Schema
const gallerySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String, required: true },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
});

// Session Schema
const sessionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Section Schema
const sectionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  class: { type: String, required: true },
  monthlyFee: { type: Number, default: 0 },
  classTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// SubjectGroup Schema
const subjectGroupSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  class: { type: String, required: true },
  subjects: [String],
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create or get models
export const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', tenantSchema);
export const Organization = Tenant; // Maintain Organization alias for backwards compatibility during migration if needed
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
export const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);
export const Staff = mongoose.models.Staff || mongoose.model('Staff', staffSchema);
export const Parent = mongoose.models.Parent || mongoose.model('Parent', parentSchema);
export const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
export const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
export const ExamResult = mongoose.models.ExamResult || mongoose.model('ExamResult', examResultSchema);
export const Fee = mongoose.models.Fee || mongoose.model('Fee', feeSchema);
export const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export const SMSLog = mongoose.models.SMSLog || mongoose.model('SMSLog', smsLogSchema);
export const WhatsAppLog = mongoose.models.WhatsAppLog || mongoose.model('WhatsAppLog', whatsappLogSchema);
export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
export const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

export const Salary = mongoose.models.Salary || mongoose.model('Salary', salarySchema);
export const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
export const Hostel = mongoose.models.Hostel || mongoose.model('Hostel', hostelSchema);
export const Gallery = mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);

export const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
export const Section = mongoose.models.Section || mongoose.model('Section', sectionSchema);
export const SubjectGroup = mongoose.models.SubjectGroup || mongoose.model('SubjectGroup', subjectGroupSchema);

// AuditLog Schema
const auditLogSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  action: { type: String, enum: ['create', 'update', 'delete'], required: true },
  entity: { type: String, required: true }, // e.g. 'Student', 'Teacher', 'Section', 'SubjectGroup', 'Fee', 'Payment'
  entityId: String,
  details: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

// Routine Schema
const routineSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  class: { type: String, required: true },
  section: { type: String, required: true },
  subject: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
  startTime: { type: String, required: true }, // e.g., '09:00'
  endTime: { type: String, required: true },   // e.g., '09:45'
  room: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Routine = mongoose.models.Routine || mongoose.model('Routine', routineSchema);

// LeaveRequest Schema
const leaveRequestSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  role: { type: String, required: true }, // 'admin', 'teacher', 'staff', 'student'
  leaveType: { type: String, enum: ['sick', 'casual', 'maternity', 'paternity', 'unpaid', 'other'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const LeaveRequest = mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', leaveRequestSchema);

// FeeCategory Schema
const feeCategorySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const FeeCategory = mongoose.models.FeeCategory || mongoose.model('FeeCategory', feeCategorySchema);

// FeeAllocation Schema
const feeAllocationSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  feeCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeCategory', required: true },
  class: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

export const FeeAllocation = mongoose.models.FeeAllocation || mongoose.model('FeeAllocation', feeAllocationSchema);

// Invitation Schema
const invitationSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  email: { type: String, required: true },
  phone: String,
  role: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Invitation = mongoose.models.Invitation || mongoose.model('Invitation', invitationSchema);

// TransportRoute Schema
const transportRouteSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  routeName: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  driverName: { type: String, required: true },
  driverPhone: String,
  routeFare: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export const TransportRoute = mongoose.models.TransportRoute || mongoose.model('TransportRoute', transportRouteSchema);

// LibraryBook Schema
const libraryBookSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: String,
  category: String,
  quantity: { type: Number, default: 1 },
  available: { type: Number, default: 1 },
  rackNo: String,
  createdAt: { type: Date, default: Date.now }
});

export const LibraryBook = mongoose.models.LibraryBook || mongoose.model('LibraryBook', libraryBookSchema);

// BookIssue Schema
const bookIssueSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryBook', required: true },
  borrowerType: { type: String, enum: ['Student', 'Teacher', 'Staff'], required: true },
  borrowerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  borrowerName: { type: String, required: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: Date,
  status: { type: String, enum: ['issued', 'returned'], default: 'issued' },
  createdAt: { type: Date, default: Date.now }
});

export const BookIssue = mongoose.models.BookIssue || mongoose.model('BookIssue', bookIssueSchema);

// SupportTicket Schema
const supportTicketSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  category: { type: String, default: 'General' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  userEmail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const SupportTicket = mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema);




