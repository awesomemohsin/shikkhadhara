import { Student, Teacher, User, Attendance, Exam, ExamResult, Fee, Session, Section, SubjectGroup, Parent, Routine, FeeCategory } from './models';
import mongoose from 'mongoose';
import { hashPassword } from './auth-utils';

export async function seedOrganizationData(tenantId: mongoose.Types.ObjectId) {
  // 1. Seed Teachers (Staffs)
  const teachersData = [
    {
      firstName: 'Tariqul',
      lastName: 'Islam',
      email: 'tariqul.islam@shikkhadhara.edu',
      phone: '+8801712345671',
      qualification: 'M.Sc. in Physics',
      specialization: 'Quantum Mechanics',
      salary: 45000,
      assignedClasses: ['Class 9 - A', 'Class 9 - B'],
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
      assignedClasses: ['Class 9 - B', 'Class 10 - A'],
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
      assignedClasses: ['Class 10 - A', 'Class 10 - B'],
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
      assignedClasses: ['Class 9 - A', 'Class 10 - B'],
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
      assignedClasses: ['Class 9 - A', 'Class 10 - A'],
      subjects: ['ICT', 'Computer Science'],
      position: 'teacher',
      status: 'active',
      employeeId: `EMP-T-${Date.now()}-5`,
    },
  ];

  const teachers = [];
  const hashedPassword = await hashPassword('admin123'); // Default password for seeded teachers
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

  // 2. Seed Students and Guardian (Parent) Links
  const studentsData = [
    // Class 9 Sec A
    { firstName: 'Ayman', lastName: 'Sadik', email: 'ayman.sadik@gmail.com', phone: '+8801512345601', class: 'Class 9', section: 'A', rollNumber: '101', guardianName: 'Sadikur Rahman', guardianPhone: '+8801812345601' },
    { firstName: 'Sumaiya', lastName: 'Rahman', email: 'sumaiya.r@gmail.com', phone: '+8801512345602', class: 'Class 9', section: 'A', rollNumber: '102', guardianName: 'Mizanur Rahman', guardianPhone: '+8801812345602' },
    { firstName: 'Tahmid', lastName: 'Hasan', email: 'tahmid.h@gmail.com', phone: '+8801512345603', class: 'Class 9', section: 'A', rollNumber: '103', guardianName: 'Abul Hasan', guardianPhone: '+8801812345603' },
    { firstName: 'Sadia', lastName: 'Jahan', email: 'sadia.j@gmail.com', phone: '+8801512345604', class: 'Class 9', section: 'A', rollNumber: '104', guardianName: 'Jahangir Alam', guardianPhone: '+8801812345604' },
    // Class 9 Sec B
    { firstName: 'Rifat', lastName: 'Hossain', email: 'rifat.h@gmail.com', phone: '+8801512345605', class: 'Class 9', section: 'B', rollNumber: '201', guardianName: 'Anwar Hossain', guardianPhone: '+8801812345605' },
    { firstName: 'Tasnim', lastName: 'Alam', email: 'tasnim.a@gmail.com', phone: '+8801512345606', class: 'Class 9', section: 'B', rollNumber: '202', guardianName: 'Shah Alam', guardianPhone: '+8801812345606' },
    { firstName: 'Nafis', lastName: 'Iqbal', email: 'nafis.i@gmail.com', phone: '+8801512345607', class: 'Class 9', section: 'B', rollNumber: '203', guardianName: 'Zafar Iqbal', guardianPhone: '+8801812345607' },
    { firstName: 'Nusrat', lastName: 'Imrose', email: 'nusrat.imrose@gmail.com', phone: '+8801512345608', class: 'Class 9', section: 'B', rollNumber: '204', guardianName: 'Imrose Hossain', guardianPhone: '+8801812345608' },
    // Class 10 Sec A
    { firstName: 'Ashraful', lastName: 'Islam', email: 'ashraful.i@gmail.com', phone: '+8801512345609', class: 'Class 10', section: 'A', rollNumber: '301', guardianName: 'Rafiqul Islam', guardianPhone: '+8801812345609' },
    { firstName: 'Mehnaz', lastName: 'Tabassum', email: 'mehnaz.t@gmail.com', phone: '+8801512345610', class: 'Class 10', section: 'A', rollNumber: '302', guardianName: 'Kamal Uddin', guardianPhone: '+8801812345610' },
    { firstName: 'Tanvir', lastName: 'Ahmed', email: 'tanvir.a@gmail.com', phone: '+8801512345611', class: 'Class 10', section: 'A', rollNumber: '303', guardianName: 'Nasir Ahmed', guardianPhone: '+8801812345611' },
    { firstName: 'Zarin', lastName: 'Tasnim', email: 'zarin.t@gmail.com', phone: '+8801512345612', class: 'Class 10', section: 'A', rollNumber: '304', guardianName: 'Ziaul Haque', guardianPhone: '+8801812345612' },
    // Class 10 Sec B
    { firstName: 'Sajid', lastName: 'Khan', email: 'sajid.k@gmail.com', phone: '+8801512345613', class: 'Class 10', section: 'B', rollNumber: '401', guardianName: 'Yousuf Khan', guardianPhone: '+8801812345613' },
    { firstName: 'Farhana', lastName: 'Yasmin', email: 'farhana.y@gmail.com', phone: '+8801512345614', class: 'Class 10', section: 'B', rollNumber: '402', guardianName: 'Abdul Khaleque', guardianPhone: '+8801812345614' },
    { firstName: 'Muntasir', lastName: 'Rahman', email: 'muntasir.r@gmail.com', phone: '+8801512345615', class: 'Class 10', section: 'B', rollNumber: '403', guardianName: 'Saidur Rahman', guardianPhone: '+8801812345615' },
  ];

  const students = [];
  const studentHashedPassword = await hashPassword('student123');
  const parentHashedPassword = await hashPassword('parent123');

  for (const s of studentsData) {
    // Create Student User account
    let studentUserId = undefined;
    if (s.email) {
      let userDoc = await User.findOne({ email: s.email });
      if (!userDoc) {
        userDoc = new User({
          email: s.email,
          password: studentHashedPassword,
          firstName: s.firstName,
          lastName: s.lastName,
          role: 'student',
          tenantId,
          status: 'active',
        });
        await userDoc.save();
      }
      studentUserId = userDoc._id;
    }

    const student = new Student({
      ...s,
      tenantId,
      userId: studentUserId,
      enrollmentId: `ENR-${Date.now()}-${s.rollNumber}`,
      status: 'active',
    });
    await student.save();
    students.push(student);

    // Create Parent User and Parent Document
    const parentEmail = `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}.parent@shikkhadhara.edu`;
    let parentUserDoc = await User.findOne({ email: parentEmail });

    if (!parentUserDoc) {
      parentUserDoc = new User({
        email: parentEmail,
        password: parentHashedPassword,
        firstName: s.guardianName.split(' ')[0] || 'Guardian',
        lastName: s.guardianName.split(' ').slice(1).join(' ') || 'User',
        role: 'parent',
        tenantId,
        status: 'active',
      });
      await parentUserDoc.save();
    }

    let parentDoc = await Parent.findOne({ userId: parentUserDoc._id });
    if (!parentDoc) {
      parentDoc = new Parent({
        tenantId,
        userId: parentUserDoc._id,
        firstName: parentUserDoc.firstName,
        lastName: parentUserDoc.lastName,
        email: parentEmail,
        phone: s.guardianPhone,
        relationship: 'father',
        childrenIds: [student._id],
      });
      await parentDoc.save();
    } else {
      parentDoc.childrenIds.push(student._id);
      await parentDoc.save();
    }
  }

  // 3. Seed Attendance
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
    { name: 'Midterm Mathematics', class: 'Class 9', subject: 'Mathematics', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), totalMarks: 100, passingMarks: 40, status: 'scheduled' },
    { name: 'Physics Lab Test', class: 'Class 9', subject: 'Physics', date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), totalMarks: 50, passingMarks: 20, status: 'scheduled' },
    { name: 'Organic Chemistry MCQ', class: 'Class 10', subject: 'Chemistry', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), totalMarks: 100, passingMarks: 40, status: 'scheduled' },
    { name: 'English Essay Writing', class: 'Class 10', subject: 'English', date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), totalMarks: 100, passingMarks: 40, status: 'scheduled' },
  ];
  const seededExams = await Exam.insertMany(examsData.map((e) => ({ ...e, tenantId })));

  // 5. Seed Exam Results for Class 9 Students
  const examResultsData = [];
  const mathExam = seededExams.find(e => e.class === 'Class 9' && e.subject === 'Mathematics');
  if (mathExam) {
    const classAStudents = students.filter(student => student.class === 'Class 9' && student.section === 'A');
    for (const student of classAStudents) {
      const marks = Math.floor(Math.random() * 40) + 60; // 60 to 100 marks
      const percentage = (marks / mathExam.totalMarks) * 100;
      let grade = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C';
      else if (percentage >= 50) grade = 'D';

      examResultsData.push({
        tenantId,
        examId: mathExam._id,
        studentId: student._id,
        marksObtained: marks,
        percentage,
        grade,
        status: percentage >= mathExam.passingMarks ? 'pass' : 'fail'
      });
    }
  }
  if (examResultsData.length > 0) {
    await ExamResult.insertMany(examResultsData);
  }

  // 6. Seed Fees
  const feesRecords = [];
  const currentMonth = today.toLocaleString('default', { month: 'short' });
  const currentYear = today.getFullYear();

  for (const student of students) {
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

  // 7. Seed Sessions
  const sessionDoc = new Session({
    tenantId,
    name: '2026-2027',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    status: 'active'
  });
  await sessionDoc.save();

  // 8. Seed Sections — Classes 1-12 with standard sections
  const allClasses = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8',
    'Class 9', 'Class 10', 'Class 11', 'Class 12',
  ];
  const upperClasses = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];

  const sectionsData: { name: string; class: string; status: string; monthlyFee: number }[] = [];
  for (const cls of allClasses) {
    sectionsData.push({ name: 'A', class: cls, status: 'active', monthlyFee: 3000 });
    sectionsData.push({ name: 'B', class: cls, status: 'active', monthlyFee: 3000 });
  }
  await Section.insertMany(sectionsData.map(s => ({ ...s, tenantId })));

  // 9. Seed Subject Groups
  // Classes 1–8: General group only
  // Classes 9–12: Science, Commerce, Arts groups
  const subjectGroupsData: { name: string; class: string; subjects: string[]; description: string }[] = [];

  for (const cls of allClasses) {
    if (upperClasses.includes(cls)) {
      subjectGroupsData.push({
        name: 'Science',
        class: cls,
        subjects: ['Physics', 'Chemistry', 'Biology', 'Higher Mathematics', 'ICT'],
        description: `Science stream for ${cls}`,
      });
      subjectGroupsData.push({
        name: 'Commerce',
        class: cls,
        subjects: ['Accounting', 'Business Studies', 'Economics', 'Finance & Banking', 'ICT'],
        description: `Commerce stream for ${cls}`,
      });
      subjectGroupsData.push({
        name: 'Arts',
        class: cls,
        subjects: ['Bangla', 'English', 'History', 'Civics', 'Economics', 'Geography'],
        description: `Arts stream for ${cls}`,
      });
    } else {
      subjectGroupsData.push({
        name: 'General',
        class: cls,
        subjects: ['Bangla', 'English', 'Mathematics', 'Science', 'Social Studies', 'Religious Studies', 'ICT'],
        description: `General subjects for ${cls}`,
      });
    }
  }
  await SubjectGroup.insertMany(subjectGroupsData.map(sg => ({ ...sg, tenantId })));

  // 10. Seed Routines (Class 9 only as representative sample)
  const routinesData = [
    // Class 9 Sec A
    { class: 'Class 9', section: 'A', subject: 'Physics', teacherIndex: 0, dayOfWeek: 'Monday', startTime: '09:00', endTime: '09:45', room: 'Room 101' },
    { class: 'Class 9', section: 'A', subject: 'Chemistry', teacherIndex: 2, dayOfWeek: 'Monday', startTime: '10:00', endTime: '10:45', room: 'Room 101' },
    { class: 'Class 9', section: 'A', subject: 'Higher Mathematics', teacherIndex: 3, dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '09:45', room: 'Room 101' },
    { class: 'Class 9', section: 'A', subject: 'Biology', teacherIndex: 1, dayOfWeek: 'Wednesday', startTime: '11:00', endTime: '11:45', room: 'Room 102' },
    // Class 9 Sec B
    { class: 'Class 9', section: 'B', subject: 'Mathematics', teacherIndex: 3, dayOfWeek: 'Monday', startTime: '09:00', endTime: '09:45', room: 'Room 201' },
    { class: 'Class 9', section: 'B', subject: 'English', teacherIndex: 1, dayOfWeek: 'Monday', startTime: '10:00', endTime: '10:45', room: 'Room 201' },
    { class: 'Class 9', section: 'B', subject: 'Science', teacherIndex: 0, dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '09:45', room: 'Room 201' },
    { class: 'Class 9', section: 'B', subject: 'ICT', teacherIndex: 4, dayOfWeek: 'Thursday', startTime: '10:00', endTime: '10:45', room: 'Lab A' },
  ];
  for (const r of routinesData) {
    const routineObj = new Routine({
      tenantId,
      class: r.class,
      section: r.section,
      subject: r.subject,
      teacherId: teachers[r.teacherIndex]?._id,
      dayOfWeek: r.dayOfWeek,
      startTime: r.startTime,
      endTime: r.endTime,
      room: r.room,
    });
    await routineObj.save();
  }

  // 11. Seed Fee Categories
  const feeCategoriesData = [
    { name: 'Admission Fee', description: 'One-time admission charge for new students' },
    { name: 'Tuition Fee', description: 'Monthly tuition charge' },
    { name: 'Exam Fee', description: 'Term exams billing category' },
    { name: 'Library Fee', description: 'Annual library membership and maintenance fee' },
    { name: 'Sports Fee', description: 'Annual sports and co-curricular fee' },
  ];
  await FeeCategory.insertMany(feeCategoriesData.map(c => ({ ...c, tenantId })));
}


