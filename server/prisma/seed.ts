import * as bcrypt from 'bcryptjs';
import { PrismaClient, Department, User, Course, Subject, TimeTable } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Lightweight Seed for Hackathon Demo
 * Fills all database tables with realistic demo data (trimmed for fast deploy)
 */
async function main() {
  console.log('🌱 Starting lightweight database seed for Hackathon Demo...\n');

  // ===========================
  // SEED ROLES
  // ===========================
  console.log('📋 Creating roles...');

  const roles = ['ADMIN', 'STAFF', 'STUDENT'] as const;

  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `${roleName.charAt(0)}${roleName.slice(1).toLowerCase()} role`,
      },
    });
    console.log(`   ✓ Role: ${roleName}`);
  }

  // ===========================
  // SEED ADMIN USER
  // ===========================
  console.log('\n👑 Creating admin user...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@campus.edu';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';

  const adminHashedPassword = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminHashedPassword,
      isActive: true,
    },
    create: {
      name: 'System Administrator',
      email: adminEmail,
      username: adminUsername,
      password: adminHashedPassword,
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
    },
  });

  console.log(`   ✓ Admin created: ${adminUser.email}`);

  // Assign ADMIN role
  const adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' },
  });

  if (adminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });
    console.log('   ✓ Admin role assigned');
  }

  // ===========================
  // SEED DEPARTMENTS (reduced to 3)
  // ===========================
  console.log('\n🏢 Creating departments...');

  const departmentsData = [
    { name: 'Computer Science', code: 'CS' },
    { name: 'Business Administration', code: 'BA' },
    { name: 'Commerce', code: 'COM' },
  ];

  const departments: Department[] = [];
  for (const dept of departmentsData) {
    const department = await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: {
        name: dept.name,
      },
    });
    departments.push(department);
    console.log(`   ✓ Department: ${dept.name}`);
  }

  const csDept = departments.find(d => d.name === 'Computer Science')!;
  const baDept = departments.find(d => d.name === 'Business Administration')!;
  const comDept = departments.find(d => d.name === 'Commerce')!;

  // ===========================
  // SEED STAFF USERS (reduced to 6)
  // ===========================
  console.log('\n👨‍💼 Creating staff users...');

  const staffHashedPassword = await bcrypt.hash('Staff@123', 12);
  const staffRole = await prisma.role.findUnique({ where: { name: 'STAFF' } });

  const allStaffData = [
    // Computer Science Staff
    { name: 'Dr. Rajesh Kuma', email: 'rajesh.cs@campus.edu', username: 'rajesh_cs', departmentId: csDept.id },
    { name: 'Prof. Meena Sharma', email: 'meena.cs@campus.edu', username: 'meena_cs', departmentId: csDept.id },
    // Business Administration Staff
    { name: 'Prof. Priya Sharma', email: 'priya.ba@campus.edu', username: 'priya_ba', departmentId: baDept.id },
    { name: 'Dr. Rohit Verma', email: 'rohit.ba@campus.edu', username: 'rohit_ba', departmentId: baDept.id },
    // Commerce Staff
    { name: 'Dr. Amit Singh', email: 'amit.com@campus.edu', username: 'amit_com', departmentId: comDept.id },
    { name: 'Prof. Kavita Jain', email: 'kavita.com@campus.edu', username: 'kavita_com', departmentId: comDept.id },
  ];

  const staffUsers: User[] = [];
  for (const staffData of allStaffData) {
    const staff = await prisma.user.upsert({
      where: { email: staffData.email },
      update: {},
      create: {
        name: staffData.name,
        email: staffData.email,
        username: staffData.username,
        password: staffHashedPassword,
        role: 'STAFF',
        departmentId: staffData.departmentId,
        isActive: true,
        isVerified: true,
      },
    });
    staffUsers.push(staff);

    if (staffRole) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: staff.id, roleId: staffRole.id } },
        update: {},
        create: { userId: staff.id, roleId: staffRole.id },
      });
    }
    console.log(`   ✓ Staff: ${staffData.name}`);
  }

  // ===========================
  // ASSIGN DEPARTMENT HODS
  // ===========================
  console.log('\n👑 Assigning Department HODs...');

  const hodAssignments = [
    { departmentId: csDept.id, email: 'rajesh.cs@campus.edu' },
    { departmentId: baDept.id, email: 'priya.ba@campus.edu' },
    { departmentId: comDept.id, email: 'amit.com@campus.edu' },
  ];

  for (const hod of hodAssignments) {
    const hodUser = staffUsers.find(s => s.email === hod.email);
    if (hodUser) {
      await prisma.departmentHOD.upsert({
        where: { departmentId: hod.departmentId },
        update: {},
        create: { departmentId: hod.departmentId, staffId: hodUser.id },
      });
      console.log(`   ✓ HOD assigned for department`);
    }
  }

  // ===========================
  // SEED COURSES (reduced to 5)
  // ===========================
  console.log('\n📚 Creating courses...');

  const coursesData = [
    { title: 'Bachelor of Computer Applications', code: 'BCA', departmentId: csDept.id, type: 'UNDERGRADUATE', duration: '3 Years', totalSemesters: 6, credits: 180 },
    { title: 'Master of Computer Applications', code: 'MCA', departmentId: csDept.id, type: 'POSTGRADUATE', duration: '2 Years', totalSemesters: 4, credits: 120 },
    { title: 'Bachelor of Business Administration', code: 'BBA', departmentId: baDept.id, type: 'UNDERGRADUATE', duration: '3 Years', totalSemesters: 6, credits: 180 },
    { title: 'Bachelor of Commerce', code: 'BCom', departmentId: comDept.id, type: 'UNDERGRADUATE', duration: '3 Years', totalSemesters: 6, credits: 180 },
    { title: 'Master of Commerce', code: 'MCom', departmentId: comDept.id, type: 'POSTGRADUATE', duration: '2 Years', totalSemesters: 4, credits: 120 },
  ];

  const courses: Course[] = [];
  for (const courseData of coursesData) {
    const course = await prisma.course.upsert({
      where: { code: courseData.code },
      update: {},
      create: {
        title: courseData.title,
        code: courseData.code,
        description: `${courseData.title} program`,
        type: courseData.type as any,
        duration: courseData.duration,
        totalSemesters: courseData.totalSemesters,
        credits: courseData.credits,
        departmentId: courseData.departmentId,
      },
    });
    courses.push(course);
    console.log(`   ✓ Course: ${courseData.code}`);
  }

  // ===========================
  // SEED SUBJECTS (reduced to 15)
  // ===========================
  console.log('\n📖 Creating subjects...');

  const subjectsData = [
    // Computer Science Subjects
    { name: 'Programming in C', code: 'BCA101', departmentId: csDept.id, semester: 1, credits: 4 },
    { name: 'Digital Electronics', code: 'BCA102', departmentId: csDept.id, semester: 1, credits: 3 },
    { name: 'Data Structures', code: 'BCA201', departmentId: csDept.id, semester: 2, credits: 4 },
    { name: 'Database Management Systems', code: 'BCA301', departmentId: csDept.id, semester: 3, credits: 4 },
    { name: 'Web Technologies', code: 'BCA401', departmentId: csDept.id, semester: 4, credits: 4 },
    { name: 'Software Engineering', code: 'BCA501', departmentId: csDept.id, semester: 5, credits: 4 },

    // Business Administration Subjects
    { name: 'Principles of Management', code: 'BBA101', departmentId: baDept.id, semester: 1, credits: 4 },
    { name: 'Business Communication', code: 'BBA103', departmentId: baDept.id, semester: 1, credits: 3 },
    { name: 'Financial Accounting', code: 'BBA201', departmentId: baDept.id, semester: 2, credits: 4 },
    { name: 'Marketing Management', code: 'BBA301', departmentId: baDept.id, semester: 3, credits: 4 },
    { name: 'Human Resource Management', code: 'BBA401', departmentId: baDept.id, semester: 4, credits: 4 },

    // Commerce Subjects
    { name: 'Financial Accounting', code: 'BCOM101', departmentId: comDept.id, semester: 1, credits: 4 },
    { name: 'Business Law', code: 'BCOM102', departmentId: comDept.id, semester: 1, credits: 3 },
    { name: 'Cost Accounting', code: 'BCOM201', departmentId: comDept.id, semester: 2, credits: 4 },
    { name: 'Income Tax', code: 'BCOM301', departmentId: comDept.id, semester: 3, credits: 4 },
  ];

  const subjects: Subject[] = [];
  for (const subjectData of subjectsData) {
    const subject = await prisma.subject.upsert({
      where: { code: subjectData.code },
      update: {},
      create: {
        name: subjectData.name,
        code: subjectData.code,
        credits: subjectData.credits,
        semester: subjectData.semester,
        departmentId: subjectData.departmentId,
      },
    });
    subjects.push(subject);
    console.log(`   ✓ Subject: ${subjectData.code} - ${subjectData.name}`);
  }

  // ===========================
  // ASSIGN STAFF TO SUBJECTS
  // ===========================
  console.log('\n👨‍🏫 Assigning staff to subjects...');

  const staffSubjectMappings: { email: string; subjectCodes: string[] }[] = [
    { email: 'rajesh.cs@campus.edu', subjectCodes: ['BCA101', 'BCA201', 'BCA301'] },
    { email: 'meena.cs@campus.edu', subjectCodes: ['BCA102', 'BCA401', 'BCA501'] },
    { email: 'priya.ba@campus.edu', subjectCodes: ['BBA101', 'BBA201', 'BBA301'] },
    { email: 'rohit.ba@campus.edu', subjectCodes: ['BBA103', 'BBA401'] },
    { email: 'amit.com@campus.edu', subjectCodes: ['BCOM101', 'BCOM201', 'BCOM301'] },
    { email: 'kavita.com@campus.edu', subjectCodes: ['BCOM102'] },
  ];

  for (const mapping of staffSubjectMappings) {
    const staff = staffUsers.find(s => s.email === mapping.email);
    if (!staff) continue;

    const assignedSubjects: string[] = [];
    for (const subjectCode of mapping.subjectCodes) {
      const subject = subjects.find(s => s.code === subjectCode);
      if (subject) {
        await prisma.staffSubject.upsert({
          where: { staffId_subjectId: { staffId: staff.id, subjectId: subject.id } },
          update: {},
          create: { staffId: staff.id, subjectId: subject.id },
        });
        assignedSubjects.push(subjectCode);
      }
    }
    console.log(`   ✓ ${staff.name}: ${assignedSubjects.join(', ')}`);
  }

  // ===========================
  // SEED STUDENTS (reduced to 15)
  // ===========================
  console.log('\n🎓 Creating student users with profiles...');

  const studentHashedPassword = await bcrypt.hash('Student@123', 12);
  const studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } });

  const studentNames = [
    // Computer Science - BCA (5 students)
    { name: 'Divya Krishnan', semester: 1, section: 'A', deptId: csDept.id, courseCode: 'BCA' },
    { name: 'Aditya Verma', semester: 1, section: 'B', deptId: csDept.id, courseCode: 'BCA' },
    { name: 'Vikash Singh', semester: 3, section: 'A', deptId: csDept.id, courseCode: 'BCA' },
    { name: 'Arjun Mehta', semester: 5, section: 'A', deptId: csDept.id, courseCode: 'BCA' },
    { name: 'Priyanka Reddy', semester: 5, section: 'B', deptId: csDept.id, courseCode: 'BCA' },

    // Business Administration - BBA (5 students)
    { name: 'Swati Joshi', semester: 1, section: 'A', deptId: baDept.id, courseCode: 'BBA' },
    { name: 'Rajat Kapoor', semester: 1, section: 'B', deptId: baDept.id, courseCode: 'BBA' },
    { name: 'Nisha Agarwal', semester: 3, section: 'A', deptId: baDept.id, courseCode: 'BBA' },
    { name: 'Megha Bhatia', semester: 5, section: 'A', deptId: baDept.id, courseCode: 'BBA' },
    { name: 'Siddharth Roy', semester: 5, section: 'B', deptId: baDept.id, courseCode: 'BBA' },

    // Commerce - BCom (5 students)
    { name: 'Sakshi Mittal', semester: 1, section: 'A', deptId: comDept.id, courseCode: 'BCom' },
    { name: 'Varun Malhotra', semester: 1, section: 'B', deptId: comDept.id, courseCode: 'BCom' },
    { name: 'Kritika Shah', semester: 3, section: 'A', deptId: comDept.id, courseCode: 'BCom' },
    { name: 'Anjali Sharma', semester: 5, section: 'A', deptId: comDept.id, courseCode: 'BCom' },
    { name: 'Nitin Jain', semester: 5, section: 'B', deptId: comDept.id, courseCode: 'BCom' },
  ];

  const studentUsers: User[] = [];
  for (let i = 0; i < studentNames.length; i++) {
    const studentData = studentNames[i];
    const emailPrefix = studentData.name.toLowerCase().replace(/\s+/g, '.');
    const email = `${emailPrefix}@novatech.edu`;
    const username = emailPrefix.replace(/\./g, '_');
    const regNo = `NT${2024 - Math.floor(studentData.semester / 2)}${String(i + 1).padStart(4, '0')}`;

    const student = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: studentData.name,
        email,
        username,
        password: studentHashedPassword,
        role: 'STUDENT',
        departmentId: studentData.deptId,
        isActive: true,
        isVerified: true,
      },
    });
    studentUsers.push(student);

    if (studentRole) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: student.id, roleId: studentRole.id } },
        update: {},
        create: { userId: student.id, roleId: studentRole.id },
      });
    }

    // Create profile for each student
    const genders: ('MALE' | 'FEMALE')[] = ['MALE', 'FEMALE'];
    const gender = genders[i % 2];
    const cgpa = (7 + Math.random() * 2.5).toFixed(2);
    const dob = new Date(2000 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28));

    await prisma.profile.upsert({
      where: { userId: student.id },
      update: {},
      create: {
        userId: student.id,
        regno: regNo,
        semester: studentData.semester,
        section: studentData.section,
        gender,
        cgpa: parseFloat(cgpa),
        DOB: dob,
        address: `${100 + i} Main Street, Bangalore, Karnataka - ${560000 + i}`,
        bio: `${studentData.name} is a dedicated student pursuing higher education.`,
        location: 'Bangalore, India',
      },
    });

    console.log(`   ✓ Student: ${studentData.name} (${regNo})`);
  }

  // ===========================
  // ENROLL STUDENTS IN COURSES
  // ===========================
  console.log('\n📝 Enrolling students in courses...');

  for (let i = 0; i < studentUsers.length; i++) {
    const student = studentUsers[i];
    const studentData = studentNames[i];
    const courseToEnroll = courses.find(c => c.code === studentData.courseCode);

    if (courseToEnroll) {
      await prisma.studentCourse.upsert({
        where: { studentId_courseId: { studentId: student.id, courseId: courseToEnroll.id } },
        update: {},
        create: { studentId: student.id, courseId: courseToEnroll.id },
      });
      console.log(`   ✓ ${studentData.name} → ${courseToEnroll.code}`);
    }
  }
  console.log(`   ✓ Total enrolled: ${studentUsers.length} students`);

  // ===========================
  // SEED TIMETABLES (trimmed - only section A, 2 slots/day)
  // ===========================
  console.log('\n📅 Creating timetables...');

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
  const timeSlots = [
    { start: 9, end: 10 },
    { start: 10, end: 11 },
    { start: 14, end: 15 },
  ];
  const rooms = ['Room 101', 'Room 102', 'Room 201', 'Lab 1', 'Hall A'];

  const timetables: TimeTable[] = [];

  for (const dept of departments) {
    const deptStaff = staffUsers.filter(s => s.departmentId === dept.id);
    const deptSubjects = subjects.filter(s => s.departmentId === dept.id);

    for (let sem = 1; sem <= 5; sem += 2) {
      const semSubjects = deptSubjects.filter(s => s.semester === sem || s.semester === sem + 1);
      if (semSubjects.length === 0) continue;

      // Only section A to reduce entries
      for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
        const day = daysOfWeek[dayIndex];

        for (let slotIndex = 0; slotIndex < 2; slotIndex++) {
          const slot = timeSlots[slotIndex];
          const subjectIndex = (dayIndex * 2 + slotIndex) % semSubjects.length;
          const subject = semSubjects[subjectIndex];
          const staffIndex = Math.floor((dayIndex + slotIndex) % deptStaff.length);
          const staff = deptStaff[staffIndex] || deptStaff[0];

          if (!staff) continue;

          const startTime = new Date(2025, 0, 1, slot.start, 0, 0);
          const endTime = new Date(2025, 0, 1, slot.end, 0, 0);

          const timetable = await prisma.timeTable.create({
            data: {
              staffId: staff.id,
              subjectId: subject.id,
              departmentId: dept.id,
              dayOfWeek: day,
              startTime,
              endTime,
              room: rooms[Math.floor(Math.random() * rooms.length)],
              semester: (sem + 1) / 2 * 2 - 1,
              section: 'A',
            },
          });
          timetables.push(timetable);
        }
      }
    }
    console.log(`   ✓ Timetable created for ${dept.name}`);
  }

  // ===========================
  // SEED ATTENDANCE SESSIONS & RECORDS (7 days instead of 30)
  // ===========================
  console.log('\n📊 Creating attendance sessions and records...');

  const today = new Date();
  const attendanceSessionsCreated: string[] = [];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);

    // Skip weekends
    if (date.getDay() === 0) continue;

    const dayOfWeek = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1];
    const dayTimetables = timetables.filter(t => t.dayOfWeek === dayOfWeek);

    for (const tt of dayTimetables.slice(0, 2)) {
      const existingSession = await prisma.attendanceSession.findUnique({
        where: { date_timetableId: { date, timetableId: tt.id } },
      });

      if (existingSession) continue;

      const session = await prisma.attendanceSession.create({
        data: {
          date,
          timetableId: tt.id,
          staffId: tt.staffId,
          subjectId: tt.subjectId,
          departmentId: tt.departmentId,
          semester: tt.semester || 1,
          section: tt.section,
          startTime: tt.startTime,
          endTime: tt.endTime,
          status: 'COMPLETED',
          isLocked: true,
        },
      });

      attendanceSessionsCreated.push(session.id);

      // Create attendance records for students in this department
      const eligibleStudents = studentUsers.filter(s =>
        s.departmentId === tt.departmentId
      );

      for (const student of eligibleStudents.slice(0, 5)) {
        const statuses: ('PRESENT' | 'ABSENT' | 'LATE')[] = ['PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        await prisma.attendanceRecord.create({
          data: {
            sessionId: session.id,
            studentId: student.id,
            status,
            remarks: status === 'ABSENT' ? 'Absent without prior notice' : undefined,
          },
        });
      }
    }
  }
  console.log(`   ✓ Created attendance sessions and records for last 7 days`);

  // ===========================
  // SEED INTERNAL MARKS
  // ===========================
  console.log('\n📝 Creating internal marks...');

  const assessmentTypes = ['IA1', 'IA2', 'IA3'] as const;

  for (const student of studentUsers) {
    const profile = await prisma.profile.findUnique({ where: { userId: student.id } });
    if (!profile?.semester) continue;

    const studentSubjects = subjects.filter(
      s => s.departmentId === student.departmentId && s.semester <= profile.semester!
    );

    for (const subject of studentSubjects.slice(0, 3)) {
      for (const assessmentType of assessmentTypes) {
        const marks = Math.floor(Math.random() * 8) + 12; // 12-20 marks

        await prisma.internalMark.upsert({
          where: {
            studentId_subjectId_semester_assessmentType: {
              studentId: student.id,
              subjectId: subject.id,
              semester: subject.semester,
              assessmentType,
            },
          },
          update: {},
          create: {
            studentId: student.id,
            subjectId: subject.id,
            marks,
            maxMarks: 20,
            semester: subject.semester,
            assessmentType,
            remarks: marks >= 16 ? 'Excellent' : marks >= 12 ? 'Good' : 'Needs Improvement',
          },
        });
      }
    }
  }
  console.log(`   ✓ Created internal marks for all students`);

  // ===========================
  // SEED EXTERNAL MARKS
  // ===========================
  console.log('\n📝 Creating external marks...');

  for (const student of studentUsers) {
    const profile = await prisma.profile.findUnique({ where: { userId: student.id } });
    if (!profile?.semester || profile.semester < 3) continue;

    const pastSubjects = subjects.filter(
      s => s.departmentId === student.departmentId && s.semester < profile.semester!
    );

    for (const subject of pastSubjects) {
      const marks = Math.floor(Math.random() * 25) + 55; // 55-80 marks

      await prisma.externalMark.upsert({
        where: {
          studentId_subjectId_semester: {
            studentId: student.id,
            subjectId: subject.id,
            semester: subject.semester,
          },
        },
        update: {},
        create: {
          studentId: student.id,
          subjectId: subject.id,
          marks,
          maxMarks: 80,
          semester: subject.semester,
          remarks: marks >= 65 ? 'Pass with Distinction' : marks >= 55 ? 'Pass' : 'Failed',
        },
      });
    }
  }
  console.log(`   ✓ Created external marks for eligible students`);

  // ===========================
  // SEED NOTICES (reduced to 5)
  // ===========================
  console.log('\n📢 Creating notices...');

  const noticesData = [
    { title: 'Mid-Semester Examination Schedule', content: 'The mid-semester examinations for all undergraduate programs will commence from February 15, 2026. Students are advised to check the detailed schedule on the notice board and prepare accordingly.', audience: 'ALL', pinned: true },
    { title: 'Annual Sports Day - Registration Open', content: 'The annual sports day is scheduled for March 10, 2026. All students interested in participating can register at the sports department by February 20, 2026.', audience: 'STUDENTS', pinned: true },
    { title: 'Faculty Development Program', content: 'A two-day faculty development program on "Modern Pedagogical Approaches" will be conducted on February 8-9, 2026. All faculty members are encouraged to attend.', audience: 'STAFF', pinned: false },
    { title: 'Placement Drive - Tech Companies', content: 'Multiple tech companies including TCS, Infosys, and Wipro will be conducting placement drives on campus during February 2026. Eligible final year students should register on the placement portal.', audience: 'STUDENTS', pinned: true },
    { title: 'Cultural Fest - Vibrance 2026', content: 'The annual cultural fest "Vibrance 2026" will be held from March 20-22, 2026. Students interested in organizing or participating should contact the cultural committee.', audience: 'ALL', pinned: true },
  ];

  const hodUsers = staffUsers.filter(s =>
    hodAssignments.some(h => s.email === h.email)
  );

  for (let i = 0; i < noticesData.length; i++) {
    const notice = noticesData[i];
    const author = hodUsers[i % hodUsers.length] || staffUsers[0];

    await prisma.notice.create({
      data: {
        title: notice.title,
        content: notice.content,
        audience: notice.audience as any,
        pinned: notice.pinned,
        authorId: author.id,
      },
    });
    console.log(`   ✓ Notice: ${notice.title}`);
  }

  // ===========================
  // SEED EXAMS (reduced to 3)
  // ===========================
  console.log('\n📝 Creating exams...');

  const examsData = [
    { name: 'Mid-Semester Examination - BCA', code: 'MID-BCA-2026', type: 'INTERNAL', date: new Date(2026, 1, 15), startHour: 9, endHour: 12, room: 'Exam Hall A', status: 'SCHEDULED' },
    { name: 'Internal Assessment 1 - BCA', code: 'IA1-BCA-2026', type: 'INTERNAL', date: new Date(2026, 0, 10), startHour: 10, endHour: 11, room: 'Room 101', status: 'COMPLETED' },
    { name: 'End Semester Examination - All Programs', code: 'END-SEM-2026', type: 'FINAL', date: new Date(2026, 3, 1), startHour: 9, endHour: 12, room: 'Exam Hall Complex', status: 'SCHEDULED' },
  ];

  for (const examData of examsData) {
    const examDate = examData.date;
    const startTime = new Date(examDate);
    startTime.setHours(examData.startHour, 0, 0, 0);
    const endTime = new Date(examDate);
    endTime.setHours(examData.endHour, 0, 0, 0);

    await prisma.exam.create({
      data: {
        name: examData.name,
        code: examData.code,
        type: examData.type as any,
        status: examData.status as any,
        date: examDate,
        startTime,
        endTime,
        room: examData.room,
        description: `${examData.name} - ${examData.type === 'FINAL' ? 'End semester examination' : 'Assessment examination'}`,
        isResultPublished: examData.status === 'COMPLETED',
        resultsPublishedAt: examData.status === 'COMPLETED' ? new Date() : null,
      },
    });
    console.log(`   ✓ Exam: ${examData.name}`);
  }

  // ===========================
  // SEED ACADEMIC EVENTS (reduced to 6)
  // ===========================
  console.log('\n🎉 Creating academic events...');

  const eventsData = [
    { title: 'Republic Day', description: 'National Holiday - Republic Day of India celebrations', date: new Date(2026, 0, 26), type: 'HOLIDAY' },
    { title: 'Holi', description: 'Festival of Colors - Holiday', date: new Date(2026, 2, 14), type: 'HOLIDAY' },
    { title: 'Independence Day', description: 'National Holiday - Independence Day of India', date: new Date(2026, 7, 15), type: 'HOLIDAY' },
    { title: 'Vibrance 2026 - Cultural Fest', description: 'Annual cultural festival with music, dance, and art competitions', date: new Date(2026, 2, 20), type: 'EVENT' },
    { title: 'Mid-Semester Examinations', description: 'Mid-semester examinations for all programs', date: new Date(2026, 1, 15), type: 'EXAM' },
    { title: 'End Semester Examinations', description: 'End semester examinations for all programs', date: new Date(2026, 3, 1), type: 'EXAM' },
  ];

  for (const event of eventsData) {
    await prisma.academicEvent.create({
      data: {
        title: event.title,
        description: event.description,
        date: event.date,
        type: event.type as any,
      },
    });
    console.log(`   ✓ Event: ${event.title}`);
  }

  // ===========================
  // SEED ASSIGNMENTS (reduced to 4)
  // ===========================
  console.log('\n📋 Creating assignments...');

  const assignmentsData = [
    { title: 'Data Structures Assignment 1', description: 'Implement linked list operations including insertion, deletion, and traversal.', semester: 3, dueOffset: 7, deptRef: csDept },
    { title: 'Web Development Project', description: 'Build a responsive portfolio website using HTML, CSS, and JavaScript.', semester: 5, dueOffset: 21, deptRef: csDept },
    { title: 'Business Communication Essay', description: 'Write a 2000-word essay on effective business communication strategies.', semester: 1, dueOffset: 7, deptRef: baDept },
    { title: 'Financial Accounting Problems', description: 'Solve the given set of 20 accounting problems covering journal entries and ledgers.', semester: 1, dueOffset: 10, deptRef: comDept },
  ];

  for (const assignment of assignmentsData) {
    const dept = assignment.deptRef;
    const subjectsForDept = subjects.filter(s => s.departmentId === dept.id);
    const subject = subjectsForDept[0];
    const author = staffUsers.find(s => s.departmentId === dept.id) || staffUsers[0];

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + assignment.dueOffset);

    const createdAssignment = await prisma.assignment.create({
      data: {
        title: assignment.title,
        description: assignment.description,
        dueDate,
        semester: assignment.semester,
        departmentId: dept.id,
        subjectId: subject?.id,
        authorId: author.id,
      },
    });

    // Create submissions for some students
    const eligibleStudents = studentUsers.filter(s => s.departmentId === dept.id);

    for (let j = 0; j < eligibleStudents.length; j++) {
      const student = eligibleStudents[j];
      const status = j < eligibleStudents.length * 0.7 ? 'SUBMITTED' : 'PENDING';

      await prisma.assignmentSubmission.create({
        data: {
          assignmentId: createdAssignment.id,
          studentId: student.id,
          status: status as any,
          submittedAt: status === 'SUBMITTED' ? new Date() : null,
          markedById: status === 'SUBMITTED' ? author.id : null,
        },
      });
    }

    console.log(`   ✓ Assignment: ${assignment.title}`);
  }

  // ===========================
  // SEED ACADEMIC YEAR
  // ===========================
  console.log('\n📅 Creating academic years...');

  const currentYear = new Date().getFullYear();

  await prisma.academicYear.upsert({
    where: { name: `${currentYear - 1}-${currentYear}` },
    update: {},
    create: {
      name: `${currentYear - 1}-${currentYear}`,
      startDate: new Date(currentYear - 1, 5, 1),
      endDate: new Date(currentYear, 4, 31),
      status: 'PAST',
    },
  });

  await prisma.academicYear.upsert({
    where: { name: `${currentYear}-${currentYear + 1}` },
    update: {},
    create: {
      name: `${currentYear}-${currentYear + 1}`,
      startDate: new Date(currentYear, 5, 1),
      endDate: new Date(currentYear + 1, 4, 31),
      status: 'ACTIVE',
    },
  });

  await prisma.academicYear.upsert({
    where: { name: `${currentYear + 1}-${currentYear + 2}` },
    update: {},
    create: {
      name: `${currentYear + 1}-${currentYear + 2}`,
      startDate: new Date(currentYear + 1, 5, 1),
      endDate: new Date(currentYear + 2, 4, 31),
      status: 'UPCOMING',
    },
  });

  console.log('   ✓ Academic years created');

  // ===========================
  // SUMMARY
  // ===========================
  console.log('\n' + '='.repeat(60));
  console.log('✅ HACKATHON DEMO DATABASE SEED COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log('\n📊 DATA SUMMARY:');
  console.log(`   • Roles: 3`);
  console.log(`   • Departments: ${departments.length}`);
  console.log(`   • Courses: ${courses.length}`);
  console.log(`   • Subjects: ${subjects.length}`);
  console.log(`   • Staff Users: ${staffUsers.length}`);
  console.log(`   • Student Users: ${studentUsers.length}`);
  console.log(`   • Timetable Entries: ${timetables.length}`);
  console.log(`   • Notices: ${noticesData.length}`);
  console.log(`   • Exams: ${examsData.length}`);
  console.log(`   • Academic Events: ${eventsData.length}`);
  console.log(`   • Assignments: ${assignmentsData.length}`);
  console.log('\n' + '='.repeat(60));
  console.log('LOGIN CREDENTIALS');
  console.log('='.repeat(60));
  console.log('\n👑 ADMIN:');
  console.log('   Email: admin@campus.edu');
  console.log('   Password: Admin@123456\n');
  console.log('👨‍💼 STAFF (All passwords: Staff@123):');
  console.log('   • rajesh.cs@campus.edu (CS HOD)');
  console.log('   • meena.cs@campus.edu (CS Faculty)');
  console.log('   • priya.ba@campus.edu (BA HOD)');
  console.log('   • rohit.ba@campus.edu (BA Faculty)');
  console.log('   • amit.com@campus.edu (Commerce HOD)');
  console.log('   • kavita.com@campus.edu (Commerce Faculty)\n');
  console.log('🎓 STUDENTS (All passwords: Student@123):');
  console.log('   • arjun.mehta@novatech.edu');
  console.log('   • priyanka.reddy@novatech.edu');
  console.log('   • divya.krishnan@novatech.edu');
  console.log('   • swati.joshi@novatech.edu');
  console.log('   • sakshi.mittal@novatech.edu');
  console.log('   • And 10 more students across departments...');
  console.log('\n' + '='.repeat(60));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
