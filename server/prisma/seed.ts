import * as bcrypt from 'bcryptjs';
import { PrismaClient, Department, User, Course, Subject, TimeTable } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Comprehensive Seed for Hackathon Demo
 * Fills all database tables with realistic demo data
 */
async function main() {
  console.log('🌱 Starting comprehensive database seed for Hackathon Demo...\n');

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
  // SEED DEPARTMENTS
  // ===========================
  console.log('\n🏢 Creating departments...');

  const departmentsData = [
    { name: 'Computer Science', code: 'CS' },
    { name: 'Business Administration', code: 'BA' },
    { name: 'Commerce', code: 'COM' },
    { name: 'Science', code: 'SCI' },
    { name: 'Arts', code: 'ART' },
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
  const sciDept = departments.find(d => d.name === 'Science')!;
  const artDept = departments.find(d => d.name === 'Arts')!;

  // ===========================
  // SEED STAFF USERS
  // ===========================
  console.log('\n👨‍💼 Creating staff users...');

  const staffHashedPassword = await bcrypt.hash('Staff@123', 12);
  const staffRole = await prisma.role.findUnique({ where: { name: 'STAFF' } });

  const allStaffData = [
    // Computer Science Staff
    { name: 'Dr. Rajesh Kumar', email: 'rajesh.cs@campus.edu', username: 'rajesh_cs', departmentId: csDept.id },
    { name: 'Prof. Meena Sharma', email: 'meena.cs@campus.edu', username: 'meena_cs', departmentId: csDept.id },
    { name: 'Dr. Arun Gupta', email: 'arun.cs@campus.edu', username: 'arun_cs', departmentId: csDept.id },
    // Business Administration Staff
    { name: 'Prof. Priya Sharma', email: 'priya.ba@campus.edu', username: 'priya_ba', departmentId: baDept.id },
    { name: 'Dr. Rohit Verma', email: 'rohit.ba@campus.edu', username: 'rohit_ba', departmentId: baDept.id },
    // Commerce Staff
    { name: 'Dr. Amit Singh', email: 'amit.com@campus.edu', username: 'amit_com', departmentId: comDept.id },
    { name: 'Prof. Kavita Jain', email: 'kavita.com@campus.edu', username: 'kavita_com', departmentId: comDept.id },
    // Science Staff
    { name: 'Prof. Sunita Patel', email: 'sunita.sci@campus.edu', username: 'sunita_sci', departmentId: sciDept.id },
    { name: 'Dr. Ramesh Yadav', email: 'ramesh.sci@campus.edu', username: 'ramesh_sci', departmentId: sciDept.id },
    // Arts Staff
    { name: 'Dr. Vikram Rao', email: 'vikram.art@campus.edu', username: 'vikram_art', departmentId: artDept.id },
    { name: 'Prof. Neha Kapoor', email: 'neha.art@campus.edu', username: 'neha_art', departmentId: artDept.id },
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
    { departmentId: sciDept.id, email: 'sunita.sci@campus.edu' },
    { departmentId: artDept.id, email: 'vikram.art@campus.edu' },
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
  // SEED COURSES
  // ===========================
  console.log('\n📚 Creating courses...');

  const coursesData = [
    { title: 'Bachelor of Computer Applications', code: 'BCA', departmentId: csDept.id, type: 'UNDERGRADUATE', duration: '3 Years', totalSemesters: 6, credits: 180 },
    { title: 'Bachelor of Science in Computer Science', code: 'BSc_CS', departmentId: csDept.id, type: 'UNDERGRADUATE', duration: '3 Years', totalSemesters: 6, credits: 180 },
    { title: 'Master of Computer Applications', code: 'MCA', departmentId: csDept.id, type: 'POSTGRADUATE', duration: '2 Years', totalSemesters: 4, credits: 120 },
    { title: 'Bachelor of Business Administration', code: 'BBA', departmentId: baDept.id, type: 'UNDERGRADUATE', duration: '3 Years', totalSemesters: 6, credits: 180 },
    { title: 'Master of Business Administration', code: 'MBA', departmentId: baDept.id, type: 'POSTGRADUATE', duration: '2 Years', totalSemesters: 4, credits: 120 },
    { title: 'Bachelor of Commerce', code: 'BCom', departmentId: comDept.id, type: 'UNDERGRADUATE', duration: '3 Years', totalSemesters: 6, credits: 180 },
    { title: 'Master of Commerce', code: 'MCom', departmentId: comDept.id, type: 'POSTGRADUATE', duration: '2 Years', totalSemesters: 4, credits: 120 },
    { title: 'Bachelor of Science in Mathematics', code: 'BSc_Math', departmentId: sciDept.id, type: 'UNDERGRADUATE', duration: '3 Years', totalSemesters: 6, credits: 180 },
    { title: 'Bachelor of Science in Physics', code: 'BSc_Physics', departmentId: sciDept.id, type: 'UNDERGRADUATE', duration: '3 Years', totalSemesters: 6, credits: 180 },
    { title: 'Bachelor of Arts in English', code: 'BA_English', departmentId: artDept.id, type: 'UNDERGRADUATE', duration: '3 Years', totalSemesters: 6, credits: 180 },
    { title: 'Bachelor of Arts in History', code: 'BA_History', departmentId: artDept.id, type: 'UNDERGRADUATE', duration: '3 Years', totalSemesters: 6, credits: 180 },
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
  // SEED SUBJECTS
  // ===========================
  console.log('\n📖 Creating subjects...');

  const subjectsData = [
    // Computer Science Subjects
    { name: 'Programming in C', code: 'BCA101', departmentId: csDept.id, semester: 1, credits: 4 },
    { name: 'Digital Electronics', code: 'BCA102', departmentId: csDept.id, semester: 1, credits: 3 },
    { name: 'Mathematics I', code: 'BCA103', departmentId: csDept.id, semester: 1, credits: 4 },
    { name: 'Data Structures', code: 'BCA201', departmentId: csDept.id, semester: 2, credits: 4 },
    { name: 'Object Oriented Programming', code: 'BCA202', departmentId: csDept.id, semester: 2, credits: 4 },
    { name: 'Database Management Systems', code: 'BCA301', departmentId: csDept.id, semester: 3, credits: 4 },
    { name: 'Operating Systems', code: 'BCA302', departmentId: csDept.id, semester: 3, credits: 4 },
    { name: 'Web Technologies', code: 'BCA401', departmentId: csDept.id, semester: 4, credits: 4 },
    { name: 'Computer Networks', code: 'BCA402', departmentId: csDept.id, semester: 4, credits: 4 },
    { name: 'Software Engineering', code: 'BCA501', departmentId: csDept.id, semester: 5, credits: 4 },
    { name: 'Machine Learning', code: 'BCA502', departmentId: csDept.id, semester: 5, credits: 4 },
    { name: 'Mobile App Development', code: 'BCA601', departmentId: csDept.id, semester: 6, credits: 4 },
    { name: 'Cloud Computing', code: 'BCA602', departmentId: csDept.id, semester: 6, credits: 4 },

    // Business Administration Subjects
    { name: 'Principles of Management', code: 'BBA101', departmentId: baDept.id, semester: 1, credits: 4 },
    { name: 'Business Mathematics', code: 'BBA102', departmentId: baDept.id, semester: 1, credits: 3 },
    { name: 'Business Communication', code: 'BBA103', departmentId: baDept.id, semester: 1, credits: 3 },
    { name: 'Financial Accounting', code: 'BBA201', departmentId: baDept.id, semester: 2, credits: 4 },
    { name: 'Organizational Behavior', code: 'BBA202', departmentId: baDept.id, semester: 2, credits: 4 },
    { name: 'Marketing Management', code: 'BBA301', departmentId: baDept.id, semester: 3, credits: 4 },
    { name: 'Human Resource Management', code: 'BBA401', departmentId: baDept.id, semester: 4, credits: 4 },

    // Commerce Subjects
    { name: 'Financial Accounting', code: 'BCOM101', departmentId: comDept.id, semester: 1, credits: 4 },
    { name: 'Business Law', code: 'BCOM102', departmentId: comDept.id, semester: 1, credits: 3 },
    { name: 'Business Economics', code: 'BCOM103', departmentId: comDept.id, semester: 1, credits: 3 },
    { name: 'Cost Accounting', code: 'BCOM201', departmentId: comDept.id, semester: 2, credits: 4 },
    { name: 'Corporate Law', code: 'BCOM202', departmentId: comDept.id, semester: 2, credits: 4 },
    { name: 'Income Tax', code: 'BCOM301', departmentId: comDept.id, semester: 3, credits: 4 },
    { name: 'Auditing', code: 'BCOM401', departmentId: comDept.id, semester: 4, credits: 4 },

    // Science Subjects
    { name: 'Calculus', code: 'MATH101', departmentId: sciDept.id, semester: 1, credits: 4 },
    { name: 'Linear Algebra', code: 'MATH102', departmentId: sciDept.id, semester: 1, credits: 4 },
    { name: 'Differential Equations', code: 'MATH201', departmentId: sciDept.id, semester: 2, credits: 4 },
    { name: 'Statistics', code: 'MATH202', departmentId: sciDept.id, semester: 2, credits: 4 },
    { name: 'Real Analysis', code: 'MATH301', departmentId: sciDept.id, semester: 3, credits: 4 },

    // Arts Subjects
    { name: 'English Literature', code: 'ENG101', departmentId: artDept.id, semester: 1, credits: 4 },
    { name: 'Creative Writing', code: 'ENG102', departmentId: artDept.id, semester: 1, credits: 3 },
    { name: 'American Literature', code: 'ENG201', departmentId: artDept.id, semester: 2, credits: 4 },
    { name: 'British Literature', code: 'ENG202', departmentId: artDept.id, semester: 2, credits: 4 },
    { name: 'Modern Poetry', code: 'ENG301', departmentId: artDept.id, semester: 3, credits: 4 },
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
  // ASSIGN STAFF TO SUBJECTS (Properly mapped by expertise)
  // ===========================
  console.log('\n👨‍🏫 Assigning staff to subjects...');

  // Define staff-subject mappings by email and subject codes
  const staffSubjectMappings: { email: string; subjectCodes: string[] }[] = [
    // Computer Science Department
    { email: 'rajesh.cs@campus.edu', subjectCodes: ['BCA101', 'BCA201', 'BCA301', 'BCA401'] }, // Programming, Data Structures, DBMS, Web Tech
    { email: 'meena.cs@campus.edu', subjectCodes: ['BCA102', 'BCA202', 'BCA302', 'BCA502'] }, // Digital Electronics, OOP, OS, ML
    { email: 'arun.cs@campus.edu', subjectCodes: ['BCA103', 'BCA402', 'BCA501', 'BCA601', 'BCA602'] }, // Math, Networks, SE, Mobile, Cloud
    
    // Business Administration Department
    { email: 'priya.ba@campus.edu', subjectCodes: ['BBA101', 'BBA201', 'BBA301'] }, // Management, Accounting, Marketing
    { email: 'rohit.ba@campus.edu', subjectCodes: ['BBA102', 'BBA103', 'BBA202', 'BBA401'] }, // Business Math, Communication, OB, HR
    
    // Commerce Department
    { email: 'amit.com@campus.edu', subjectCodes: ['BCOM101', 'BCOM201', 'BCOM301', 'BCOM401'] }, // Accounting, Cost Accounting, Tax, Audit
    { email: 'kavita.com@campus.edu', subjectCodes: ['BCOM102', 'BCOM103', 'BCOM202'] }, // Business Law, Economics, Corporate Law
    
    // Science Department
    { email: 'sunita.sci@campus.edu', subjectCodes: ['MATH101', 'MATH102', 'MATH301'] }, // Calculus, Linear Algebra, Real Analysis
    { email: 'ramesh.sci@campus.edu', subjectCodes: ['MATH201', 'MATH202'] }, // Differential Equations, Statistics
    
    // Arts Department
    { email: 'vikram.art@campus.edu', subjectCodes: ['ENG101', 'ENG201', 'ENG301'] }, // English Lit, American Lit, Modern Poetry
    { email: 'neha.art@campus.edu', subjectCodes: ['ENG102', 'ENG202'] }, // Creative Writing, British Lit
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
  // SEED STUDENTS
  // ===========================
  console.log('\n🎓 Creating student users with profiles...');

  const studentHashedPassword = await bcrypt.hash('Student@123', 12);
  const studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } });

  const studentNames = [
    // =====================================
    // Computer Science Department - BCA
    // =====================================
    // Semester 1 (Freshers)
    { name: 'Divya Krishnan', semester: 1, section: 'A', deptId: csDept.id, courseCode: 'BCA' },
    { name: 'Aditya Verma', semester: 1, section: 'A', deptId: csDept.id, courseCode: 'BCA' },
    { name: 'Pooja Malhotra', semester: 1, section: 'B', deptId: csDept.id, courseCode: 'BCA' },
    { name: 'Suresh Kumar', semester: 1, section: 'B', deptId: csDept.id, courseCode: 'BCA' },
    // Semester 3
    { name: 'Vikash Singh', semester: 3, section: 'A', deptId: csDept.id, courseCode: 'BCA' },
    { name: 'Ananya Sharma', semester: 3, section: 'A', deptId: csDept.id, courseCode: 'BCA' },
    { name: 'Karthik Iyer', semester: 3, section: 'B', deptId: csDept.id, courseCode: 'BCA' },
    { name: 'Deepika Patel', semester: 3, section: 'B', deptId: csDept.id, courseCode: 'BCA' },
    { name: 'Rohit Choudhury', semester: 3, section: 'A', deptId: csDept.id, courseCode: 'BCA' },
    // Semester 5 (Final Year)
    { name: 'Arjun Mehta', semester: 5, section: 'A', deptId: csDept.id, courseCode: 'BCA' },
    { name: 'Priyanka Reddy', semester: 5, section: 'A', deptId: csDept.id, courseCode: 'BCA' },
    { name: 'Rahul Nair', semester: 5, section: 'B', deptId: csDept.id, courseCode: 'BCA' },
    { name: 'Sneha Gupta', semester: 5, section: 'B', deptId: csDept.id, courseCode: 'BCA' },
    { name: 'Mohit Sharma', semester: 5, section: 'A', deptId: csDept.id, courseCode: 'BCA' },
    { name: 'Ritika Singh', semester: 5, section: 'B', deptId: csDept.id, courseCode: 'BCA' },

    // =====================================
    // Business Administration Department - BBA
    // =====================================
    // Semester 1
    { name: 'Swati Joshi', semester: 1, section: 'A', deptId: baDept.id, courseCode: 'BBA' },
    { name: 'Rajat Kapoor', semester: 1, section: 'A', deptId: baDept.id, courseCode: 'BBA' },
    { name: 'Ravi Shankar', semester: 1, section: 'B', deptId: baDept.id, courseCode: 'BBA' },
    { name: 'Pallavi Desai', semester: 1, section: 'B', deptId: baDept.id, courseCode: 'BBA' },
    // Semester 3
    { name: 'Nisha Agarwal', semester: 3, section: 'A', deptId: baDept.id, courseCode: 'BBA' },
    { name: 'Amit Saxena', semester: 3, section: 'A', deptId: baDept.id, courseCode: 'BBA' },
    { name: 'Kavya Menon', semester: 3, section: 'B', deptId: baDept.id, courseCode: 'BBA' },
    // Semester 5
    { name: 'Megha Bhatia', semester: 5, section: 'A', deptId: baDept.id, courseCode: 'BBA' },
    { name: 'Siddharth Roy', semester: 5, section: 'A', deptId: baDept.id, courseCode: 'BBA' },
    { name: 'Kunal Thakur', semester: 5, section: 'B', deptId: baDept.id, courseCode: 'BBA' },

    // =====================================
    // Commerce Department - BCom
    // =====================================
    // Semester 1
    { name: 'Sakshi Mittal', semester: 1, section: 'A', deptId: comDept.id, courseCode: 'BCom' },
    { name: 'Varun Malhotra', semester: 1, section: 'A', deptId: comDept.id, courseCode: 'BCom' },
    { name: 'Shruti Agrawal', semester: 1, section: 'B', deptId: comDept.id, courseCode: 'BCom' },
    // Semester 3
    { name: 'Kritika Shah', semester: 3, section: 'A', deptId: comDept.id, courseCode: 'BCom' },
    { name: 'Pankaj Gupta', semester: 3, section: 'A', deptId: comDept.id, courseCode: 'BCom' },
    { name: 'Manish Tiwari', semester: 3, section: 'B', deptId: comDept.id, courseCode: 'BCom' },
    // Semester 5
    { name: 'Anjali Sharma', semester: 5, section: 'A', deptId: comDept.id, courseCode: 'BCom' },
    { name: 'Nitin Jain', semester: 5, section: 'A', deptId: comDept.id, courseCode: 'BCom' },

    // =====================================
    // Science Department - BSc Math
    // =====================================
    // Semester 1
    { name: 'Gaurav Pandey', semester: 1, section: 'A', deptId: sciDept.id, courseCode: 'BSc_Math' },
    { name: 'Shikha Verma', semester: 1, section: 'A', deptId: sciDept.id, courseCode: 'BSc_Math' },
    // Semester 3
    { name: 'Ashish Rana', semester: 3, section: 'A', deptId: sciDept.id, courseCode: 'BSc_Math' },
    { name: 'Neetu Singh', semester: 3, section: 'A', deptId: sciDept.id, courseCode: 'BSc_Math' },
    // Semester 5
    { name: 'Harsh Vardhan', semester: 5, section: 'A', deptId: sciDept.id, courseCode: 'BSc_Math' },
    { name: 'Simran Kaur', semester: 5, section: 'A', deptId: sciDept.id, courseCode: 'BSc_Math' },

    // =====================================
    // Arts Department - BA English
    // =====================================
    // Semester 1
    { name: 'Ishaan Malhotra', semester: 1, section: 'A', deptId: artDept.id, courseCode: 'BA_English' },
    { name: 'Aditi Sharma', semester: 1, section: 'A', deptId: artDept.id, courseCode: 'BA_English' },
    // Semester 3
    { name: 'Tanvi Joshi', semester: 3, section: 'A', deptId: artDept.id, courseCode: 'BA_English' },
    { name: 'Vivek Singh', semester: 3, section: 'A', deptId: artDept.id, courseCode: 'BA_English' },
    // Semester 5
    { name: 'Riya Kapoor', semester: 5, section: 'A', deptId: artDept.id, courseCode: 'BA_English' },
    { name: 'Aryan Gupta', semester: 5, section: 'A', deptId: artDept.id, courseCode: 'BA_English' },
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
      console.log(`   ✓ ${studentData.name} → ${courseToEnroll.code} (Sem ${studentData.semester}, Section ${studentData.section})`);
    }
  }
  console.log(`   ✓ Total enrolled: ${studentUsers.length} students`);

  // ===========================
  // SEED TIMETABLES
  // ===========================
  console.log('\n📅 Creating timetables...');

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
  const timeSlots = [
    { start: 9, end: 10 },
    { start: 10, end: 11 },
    { start: 11, end: 12 },
    { start: 14, end: 15 },
    { start: 15, end: 16 },
  ];
  const rooms = ['Room 101', 'Room 102', 'Room 201', 'Room 202', 'Lab 1', 'Lab 2', 'Hall A', 'Hall B'];

  const timetables: TimeTable[] = [];

  // Create timetables for each department
  for (const dept of departments) {
    const deptStaff = staffUsers.filter(s => s.departmentId === dept.id);
    const deptSubjects = subjects.filter(s => s.departmentId === dept.id);

    for (let sem = 1; sem <= 6; sem += 2) {
      const semSubjects = deptSubjects.filter(s => s.semester === sem || s.semester === sem + 1);
      if (semSubjects.length === 0) continue;

      for (const section of ['A', 'B']) {
        for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
          const day = daysOfWeek[dayIndex];
          
          for (let slotIndex = 0; slotIndex < 3; slotIndex++) {
            const slot = timeSlots[slotIndex];
            const subjectIndex = (dayIndex * 3 + slotIndex) % semSubjects.length;
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
                semester: (sem + 1) / 2 * 2 - 1, // Odd semesters
                section,
              },
            });
            timetables.push(timetable);
          }
        }
      }
    }
    console.log(`   ✓ Timetable created for ${dept.name}`);
  }

  // ===========================
  // SEED ATTENDANCE SESSIONS & RECORDS
  // ===========================
  console.log('\n📊 Creating attendance sessions and records...');

  const today = new Date();
  const attendanceSessionsCreated: string[] = [];

  // Create attendance for the last 30 days
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    
    // Skip weekends
    if (date.getDay() === 0) continue;

    const dayOfWeek = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1];
    const dayTimetables = timetables.filter(t => t.dayOfWeek === dayOfWeek);

    for (const tt of dayTimetables.slice(0, 3)) {
      // Check if session already exists for this date and timetable
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

      // Create attendance records for students in this department/semester/section
      const eligibleStudents = studentUsers.filter(s => 
        s.departmentId === tt.departmentId
      );

      for (const student of eligibleStudents.slice(0, 10)) {
        const statuses: ('PRESENT' | 'ABSENT' | 'LATE')[] = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE'];
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
  console.log(`   ✓ Created attendance sessions and records for last 30 days`);

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

    for (const subject of studentSubjects.slice(0, 4)) {
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
  // SEED NOTICES
  // ===========================
  console.log('\n📢 Creating notices...');

  const noticesData = [
    { title: 'Mid-Semester Examination Schedule', content: 'The mid-semester examinations for all undergraduate programs will commence from February 15, 2026. Students are advised to check the detailed schedule on the notice board and prepare accordingly. Please ensure you have your hall tickets ready.', audience: 'ALL', pinned: true },
    { title: 'Annual Sports Day - Registration Open', content: 'The annual sports day is scheduled for March 10, 2026. All students interested in participating can register at the sports department by February 20, 2026. Events include athletics, swimming, basketball, cricket, and more.', audience: 'STUDENTS', pinned: true },
    { title: 'Faculty Development Program', content: 'A two-day faculty development program on "Modern Pedagogical Approaches" will be conducted on February 8-9, 2026. All faculty members are encouraged to attend. Registration is mandatory.', audience: 'STAFF', pinned: false },
    { title: 'Library Timings Extended', content: 'In view of the upcoming examinations, the central library will remain open from 8:00 AM to 10:00 PM starting January 20, 2026. Students are requested to maintain silence and discipline in the library premises.', audience: 'ALL', pinned: false },
    { title: 'Campus Wifi Maintenance', content: 'The campus WiFi network will undergo scheduled maintenance on January 30, 2026, from 11:00 PM to 5:00 AM. Users may experience intermittent connectivity during this period. We apologize for any inconvenience.', audience: 'ALL', pinned: false },
    { title: 'Placement Drive - Tech Companies', content: 'Multiple tech companies including TCS, Infosys, and Wipro will be conducting placement drives on campus during February 2026. Eligible final year students should register on the placement portal by January 31, 2026.', audience: 'STUDENTS', pinned: true },
    { title: 'Fee Payment Reminder', content: 'This is a gentle reminder that the last date for fee payment for the current semester is February 5, 2026. Late payments will attract a fine as per university regulations.', audience: 'STUDENTS', pinned: false },
    { title: 'Cultural Fest - Vibrance 2026', content: 'The annual cultural fest "Vibrance 2026" will be held from March 20-22, 2026. Students interested in organizing or participating should contact the cultural committee.', audience: 'ALL', pinned: true },
    { title: 'Workshop on AI and Machine Learning', content: 'A hands-on workshop on Artificial Intelligence and Machine Learning will be conducted by the Computer Science department on February 12, 2026. Registration fee: Rs. 200. Limited seats available.', audience: 'STUDENTS', pinned: false },
    { title: 'Result Declaration - Previous Semester', content: 'The results for the previous semester examinations have been declared. Students can check their results on the university portal using their credentials.', audience: 'STUDENTS', pinned: false },
    { title: 'Guest Lecture Series', content: 'Distinguished industry experts will be delivering guest lectures throughout February 2026. Topics include Blockchain Technology, Data Science, and Entrepreneurship. Attendance is encouraged for all departments.', audience: 'ALL', pinned: false },
    { title: 'Anti-Ragging Committee Meeting', content: 'The Anti-Ragging Committee will hold its monthly meeting on February 1, 2026, at 3:00 PM in the conference room. All members are requested to attend.', audience: 'STAFF', pinned: false },
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
  // SEED EXAMS
  // ===========================
  console.log('\n📝 Creating exams...');

  const examsData = [
    { name: 'Mid-Semester Examination - BCA', code: 'MID-BCA-2026', type: 'INTERNAL', date: new Date(2026, 1, 15), startHour: 9, endHour: 12, room: 'Exam Hall A', status: 'SCHEDULED' },
    { name: 'Mid-Semester Examination - BBA', code: 'MID-BBA-2026', type: 'INTERNAL', date: new Date(2026, 1, 16), startHour: 9, endHour: 12, room: 'Exam Hall B', status: 'SCHEDULED' },
    { name: 'Mid-Semester Examination - BCom', code: 'MID-BCOM-2026', type: 'INTERNAL', date: new Date(2026, 1, 17), startHour: 9, endHour: 12, room: 'Exam Hall A', status: 'SCHEDULED' },
    { name: 'Practical Examination - Computer Lab', code: 'PRAC-CS-2026', type: 'PRACTICAL', date: new Date(2026, 1, 20), startHour: 14, endHour: 17, room: 'Computer Lab 1', status: 'SCHEDULED' },
    { name: 'End Semester Examination - All Programs', code: 'END-SEM-2026', type: 'FINAL', date: new Date(2026, 3, 1), startHour: 9, endHour: 12, room: 'Exam Hall Complex', status: 'SCHEDULED' },
    { name: 'Internal Assessment 1 - BCA', code: 'IA1-BCA-2026', type: 'INTERNAL', date: new Date(2026, 0, 10), startHour: 10, endHour: 11, room: 'Room 101', status: 'COMPLETED' },
    { name: 'Internal Assessment 1 - BBA', code: 'IA1-BBA-2026', type: 'INTERNAL', date: new Date(2026, 0, 11), startHour: 10, endHour: 11, room: 'Room 201', status: 'COMPLETED' },
    { name: 'Internal Assessment 2 - BCA', code: 'IA2-BCA-2026', type: 'INTERNAL', date: new Date(2026, 0, 25), startHour: 10, endHour: 11, room: 'Room 101', status: 'COMPLETED' },
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
  // SEED ACADEMIC EVENTS
  // ===========================
  console.log('\n🎉 Creating academic events...');

  const eventsData = [
    { title: 'Republic Day', description: 'National Holiday - Republic Day of India celebrations', date: new Date(2026, 0, 26), type: 'HOLIDAY' },
    { title: 'Holi', description: 'Festival of Colors - Holiday', date: new Date(2026, 2, 14), type: 'HOLIDAY' },
    { title: 'Good Friday', description: 'Religious Holiday', date: new Date(2026, 3, 3), type: 'HOLIDAY' },
    { title: 'Independence Day', description: 'National Holiday - Independence Day of India', date: new Date(2026, 7, 15), type: 'HOLIDAY' },
    { title: 'Gandhi Jayanti', description: 'National Holiday - Birth Anniversary of Mahatma Gandhi', date: new Date(2026, 9, 2), type: 'HOLIDAY' },
    { title: 'Diwali', description: 'Festival of Lights - Holiday', date: new Date(2026, 10, 11), type: 'HOLIDAY' },
    { title: 'Christmas', description: 'Christmas Holiday', date: new Date(2026, 11, 25), type: 'HOLIDAY' },
    { title: 'Vibrance 2026 - Cultural Fest', description: 'Annual cultural festival with music, dance, and art competitions', date: new Date(2026, 2, 20), type: 'EVENT' },
    { title: 'Tech Summit 2026', description: 'Annual technology summit featuring guest lectures and workshops', date: new Date(2026, 1, 18), type: 'EVENT' },
    { title: 'Sports Day', description: 'Annual sports day with various athletic events', date: new Date(2026, 2, 10), type: 'EVENT' },
    { title: 'Convocation Ceremony', description: 'Annual convocation for graduating students', date: new Date(2026, 3, 15), type: 'EVENT' },
    { title: 'Freshers Day', description: 'Welcome event for new students', date: new Date(2026, 6, 1), type: 'EVENT' },
    { title: 'Annual Day', description: 'Annual day celebrations with cultural performances', date: new Date(2026, 11, 15), type: 'EVENT' },
    { title: 'Mid-Semester Examinations', description: 'Mid-semester examinations for all programs', date: new Date(2026, 1, 15), type: 'EXAM' },
    { title: 'End Semester Examinations', description: 'End semester examinations for all programs', date: new Date(2026, 3, 1), type: 'EXAM' },
    { title: 'Practical Examinations', description: 'Practical examinations for science and computer programs', date: new Date(2026, 3, 15), type: 'EXAM' },
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
  // SEED ASSIGNMENTS
  // ===========================
  console.log('\n📋 Creating assignments...');

  const assignmentsData = [
    { title: 'Data Structures Assignment 1', description: 'Implement linked list operations including insertion, deletion, and traversal. Include time complexity analysis.', semester: 3, dueOffset: 7 },
    { title: 'DBMS Case Study', description: 'Design a complete database schema for an e-commerce platform. Include ER diagrams, normalization, and SQL queries.', semester: 3, dueOffset: 14 },
    { title: 'Web Development Project', description: 'Build a responsive portfolio website using HTML, CSS, and JavaScript. Include contact form and gallery.', semester: 5, dueOffset: 21 },
    { title: 'Machine Learning Report', description: 'Write a detailed report on supervised learning algorithms with practical examples and code implementations.', semester: 5, dueOffset: 14 },
    { title: 'Programming in C Lab', description: 'Complete all 10 lab programs from the syllabus. Submit source code with output screenshots.', semester: 1, dueOffset: 10 },
    { title: 'Operating Systems Assignment', description: 'Simulate CPU scheduling algorithms - FCFS, SJF, Round Robin, and Priority scheduling.', semester: 3, dueOffset: 14 },
    { title: 'Software Engineering Report', description: 'Create a Software Requirements Specification (SRS) document for a library management system.', semester: 5, dueOffset: 21 },
    { title: 'Business Communication Essay', description: 'Write a 2000-word essay on effective business communication strategies in the digital age.', semester: 1, dueOffset: 7 },
    { title: 'Financial Accounting Problems', description: 'Solve the given set of 20 accounting problems covering journal entries, ledgers, and trial balance.', semester: 1, dueOffset: 10 },
    { title: 'Marketing Plan Project', description: 'Develop a comprehensive marketing plan for a startup company of your choice.', semester: 3, dueOffset: 21 },
  ];

  for (let i = 0; i < assignmentsData.length; i++) {
    const assignment = assignmentsData[i];
    const dept = i < 7 ? csDept : (i < 9 ? comDept : baDept);
    const subjectsForDept = subjects.filter(s => s.departmentId === dept.id);
    const subject = subjectsForDept[i % subjectsForDept.length];
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

  // Previous year (Past)
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

  // Current year (Active)
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

  // Next year (Upcoming)
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
  console.log('   • amit.com@campus.edu (Commerce HOD)');
  console.log('   • sunita.sci@campus.edu (Science HOD)');
  console.log('   • vikram.art@campus.edu (Arts HOD)\n');
  console.log('🎓 STUDENTS (All passwords: Student@123):');
  console.log('   • arjun.mehta@novatech.edu');
  console.log('   • priyanka.reddy@novatech.edu');
  console.log('   • rahul.nair@novatech.edu');
  console.log('   • sneha.gupta@novatech.edu');
  console.log('   • And 41 more students across departments...');
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
