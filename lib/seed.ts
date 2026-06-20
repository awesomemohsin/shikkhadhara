import { Student, Teacher, User, Attendance, Exam, Fee, Session, Section, SubjectGroup } from './models';
import mongoose from 'mongoose';
import { hashPassword } from './auth-utils';

export async function seedOrganizationData(tenantId: mongoose.Types.ObjectId) {
  // 1. Seed Teachers
  const teachersData = [
    {
      firstName: 'Tariqul',
      lastName: 'Islam',
      email: 'tariqul.islam@shikkhadhara.edu',
      phone: '+8801712345671',
      qualification: 'M.Sc. in Physics',
      specialization: 'Quantum Mechanics',
      salary: 45000,
      assignedClasses: ['A', 'B'],
      subjects: ['Physics', 'Science'],
      position: 'senior_teacher',
      status: 'active',
      employeeId: `EMP-T-${Date.now()}-1`,
    },
    {
      firstName: 'Sabiha',
      lastName: 'Sultana',
      email: 'sabiha.sultana@shikkhadhara.edu',
      phone: '+8801712345672',
      qualification: 'M.A. in English',
      specialization: 'English Literature',
      salary: 40000,
      assignedClasses: ['B', 'C'],
      subjects: ['English', 'Literature'],
      position: 'teacher',
      status: 'active',
      employeeId: `EMP-T-${Date.now()}-2`,
    },
    {
      firstName: 'Kamrul',
      lastName: 'Hasan',
      email: 'kamrul.hasan@shikkhadhara.edu',
      phone: '+8801712345673',
      qualification: 'Ph.D. in Chemistry',
      specialization: 'Organic Chemistry',
      salary: 55000,
      assignedClasses: ['C', 'D'],
      subjects: ['Chemistry', 'Science'],
      position: 'headmaster',
      status: 'active',
      employeeId: `EMP-T-${Date.now()}-3`,
    },
    {
      firstName: 'Mahbubur',
      lastName: 'Rahman',
      email: 'mahbubur.rahman@shikkhadhara.edu',
      phone: '+8801712345674',
      qualification: 'Ph.D. in Mathematics',
      specialization: 'Theoretical Mathematics',
      salary: 60000,
      assignedClasses: ['A', 'D'],
      subjects: ['Mathematics', 'Higher Math'],
      position: 'associate_headmaster',
      status: 'active',
      employeeId: `EMP-T-${Date.now()}-4`,
    },
    {
      firstName: 'Fahmida',
      lastName: 'Chowdhury',
      email: 'fahmida.c@shikkhadhara.edu',
      phone: '+8801712345675',
      qualification: 'Ph.D. in Computer Science',
      specialization: 'Compiler Design',
      salary: 50000,
      assignedClasses: ['A', 'C'],
      subjects: ['ICT', 'Computer Science'],
      position: 'teacher',
      status: 'active',
      employeeId: `EMP-T-${Date.now()}-5`,
    },
  ];

  const teachers = [];
  const hashedPassword = await hashPassword('admin123'); // Default password for all seeded staff
  for (const t of teachersData) {
    let userId = undefined;
    if (t.email) {
      let userDoc = await User.findOne({ email: t.email });
      if (!userDoc) {
        userDoc = new User({
          email: t.email,
          password: hashedPassword,
          firstName: t.firstName,
          lastName: t.lastName,
          role: 'teacher',
          tenantId,
          status: 'active',
        });
        await userDoc.save();
      }
      userId = userDoc._id;
    }

    const teacher = new Teacher({
      ...t,
      tenantId,
      userId,
    });
    await teacher.save();
    teachers.push(teacher);
  }

  // 2. Seed Students
  const studentsData = [
    // Class A
    { firstName: 'Ayman', lastName: 'Sadik', email: 'ayman.sadik@gmail.com', phone: '+8801512345601', class: 'A', rollNumber: '101', guardianName: 'Sadikur Rahman', guardianPhone: '+8801812345601' },
    { firstName: 'Sumaiya', lastName: 'Rahman', email: 'sumaiya.r@gmail.com', phone: '+8801512345602', class: 'A', rollNumber: '102', guardianName: 'Mizanur Rahman', guardianPhone: '+8801812345602' },
    { firstName: 'Tahmid', lastName: 'Hasan', email: 'tahmid.h@gmail.com', phone: '+8801512345603', class: 'A', rollNumber: '103', guardianName: 'Abul Hasan', guardianPhone: '+8801812345603' },
    { firstName: 'Sadia', lastName: 'Jahan', email: 'sadia.j@gmail.com', phone: '+8801512345604', class: 'A', rollNumber: '104', guardianName: 'Jahangir Alam', guardianPhone: '+8801812345604' },
    // Class B
    { firstName: 'Rifat', lastName: 'Hossain', email: 'rifat.h@gmail.com', phone: '+8801512345605', class: 'B', rollNumber: '201', guardianName: 'Anwar Hossain', guardianPhone: '+8801812345605' },
    { firstName: 'Tasnim', lastName: 'Alam', email: 'tasnim.a@gmail.com', phone: '+8801512345606', class: 'B', rollNumber: '202', guardianName: 'Shah Alam', guardianPhone: '+8801812345606' },
    { firstName: 'Nafis', lastName: 'Iqbal', email: 'nafis.i@gmail.com', phone: '+8801512345607', class: 'B', rollNumber: '203', guardianName: 'Zafar Iqbal', guardianPhone: '+8801812345607' },
    { firstName: 'Nusrat', lastName: 'Imrose', email: 'nusrat.imrose@gmail.com', phone: '+8801512345608', class: 'B', rollNumber: '204', guardianName: 'Imrose Hossain', guardianPhone: '+8801812345608' },
    // Class C
    { firstName: 'Ashraful', lastName: 'Islam', email: 'ashraful.i@gmail.com', phone: '+8801512345609', class: 'C', rollNumber: '301', guardianName: 'Rafiqul Islam', guardianPhone: '+8801812345609' },
    { firstName: 'Mehnaz', lastName: 'Tabassum', email: 'mehnaz.t@gmail.com', phone: '+8801512345610', class: 'C', rollNumber: '302', guardianName: 'Kamal Uddin', guardianPhone: '+8801812345610' },
    { firstName: 'Tanvir', lastName: 'Ahmed', email: 'tanvir.a@gmail.com', phone: '+8801512345611', class: 'C', rollNumber: '303', guardianName: 'Nasir Ahmed', guardianPhone: '+8801812345611' },
    { firstName: 'Zarin', lastName: 'Tasnim', email: 'zarin.t@gmail.com', phone: '+8801512345612', class: 'C', rollNumber: '304', guardianName: 'Ziaul Haque', guardianPhone: '+8801812345612' },
    // Class D
    { firstName: 'Sajid', lastName: 'Khan', email: 'sajid.k@gmail.com', phone: '+8801512345613', class: 'D', rollNumber: '401', guardianName: 'Yousuf Khan', guardianPhone: '+8801812345613' },
    { firstName: 'Farhana', lastName: 'Yasmin', email: 'farhana.y@gmail.com', phone: '+8801512345614', class: 'D', rollNumber: '402', guardianName: 'Abdul Khaleque', guardianPhone: '+8801812345614' },
    { firstName: 'Muntasir', lastName: 'Rahman', email: 'muntasir.r@gmail.com', phone: '+8801512345615', class: 'D', rollNumber: '403', guardianName: 'Saidur Rahman', guardianPhone: '+8801812345615' },
  ];

  const students = [];
  for (const s of studentsData) {
    const student = new Student({
      ...s,
      tenantId,
      enrollmentId: `ENR-${Date.now()}-${s.rollNumber}`,
      status: 'active',
    });
    await student.save();
    students.push(student);
  }

  // 3. Seed Attendance (mix of status: present, absent, late)
  const attendanceRecords = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const statuses = ['present', 'present', 'present', 'present', 'present', 'present', 'present', 'late', 'absent'];

  for (const student of students) {
    const randStatus = statuses[Math.floor(Math.random() * statuses.length)];
    attendanceRecords.push({
      tenantId,
      studentId: student._id,
      class: student.class,
      date: today,
      status: randStatus,
    });
  }
  await Attendance.insertMany(attendanceRecords);

  // 4. Seed Exams
  const examsData = [
    { name: 'Midterm Mathematics', class: 'A', subject: 'Mathematics', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), totalMarks: 100, passingMarks: 40, status: 'scheduled' },
    { name: 'Physics Lab Test', class: 'B', subject: 'Physics', date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), totalMarks: 50, passingMarks: 20, status: 'scheduled' },
    { name: 'Organic Chemistry MCQ', class: 'C', subject: 'Chemistry', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), totalMarks: 100, passingMarks: 40, status: 'scheduled' },
    { name: 'English Essay Writing', class: 'D', subject: 'English', date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), totalMarks: 100, passingMarks: 40, status: 'scheduled' },
  ];
  await Exam.insertMany(examsData.map((e) => ({ ...e, tenantId })));

  // 5. Seed Fees (Monthly tuition fee and exam fee)
  const feesRecords = [];
  const currentMonth = today.toLocaleString('default', { month: 'short' });
  const currentYear = today.getFullYear();

  for (const student of students) {
    // 1. Tuition Fee (Paid or Pending)
    const tuitionPaid = Math.random() > 0.3;
    feesRecords.push({
      tenantId,
      studentId: student._id,
      feeType: 'Tuition Fee',
      amount: 5000,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      paidDate: tuitionPaid ? new Date() : undefined,
      status: tuitionPaid ? 'paid' : 'pending',
      amountPaid: tuitionPaid ? 5000 : 0,
      month: currentMonth,
      year: currentYear,
    });

    // 2. Exam Fee (Paid or Pending)
    const examPaid = Math.random() > 0.5;
    feesRecords.push({
      tenantId,
      studentId: student._id,
      feeType: 'Exam Fee',
      amount: 1500,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      paidDate: examPaid ? new Date() : undefined,
      status: examPaid ? 'paid' : 'pending',
      amountPaid: examPaid ? 1500 : 0,
      month: currentMonth,
      year: currentYear,
    });
  }
  await Fee.insertMany(feesRecords);

  // 6. Seed Sessions
  const sessionDoc = new Session({
    tenantId,
    name: '2026-2027',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    status: 'active'
  });
  await sessionDoc.save();

  // 7. Seed Sections
  const sectionsData = [
    { name: 'A', class: 'A', status: 'active' },
    { name: 'B', class: 'B', status: 'active' },
    { name: 'C', class: 'C', status: 'active' },
    { name: 'D', class: 'D', status: 'active' },
  ];
  await Section.insertMany(sectionsData.map(s => ({ ...s, tenantId })));

  // 8. Seed Subject Groups
  const subjectGroupsData = [
    { name: 'Science Group', class: 'A', subjects: ['Physics', 'Chemistry', 'Higher Math', 'Biology'], description: 'General Science Stream' },
    { name: 'General Group', class: 'B', subjects: ['Mathematics', 'English', 'Science', 'ICT'], description: 'General Studies' }
  ];
  await SubjectGroup.insertMany(subjectGroupsData.map(sg => ({ ...sg, tenantId })));
}
