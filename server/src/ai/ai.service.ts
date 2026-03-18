import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CMSUserRole } from '@prisma/client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIResponse {
  message: string;
  role: string;
  timestamp: Date;
}

@Injectable()
export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY1');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY1 is not configured');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  private getRolePrompt(role: string): string {
    const rolePrompts = {
      ADMIN: `You are an AI assistant for a Campus Management System. You are helping an ADMIN user.
Your capabilities include:
- Managing users (staff, students)
- System configuration and settings
- Viewing all reports and analytics
- Managing academic years, courses, subjects
- Handling notices, events, and announcements
- Managing attendance, exams, and grades
- Full system access and control

Be professional, helpful, and provide detailed information. Always confirm actions that would modify data.`,

      STAFF: `You are an AI assistant for a Campus Management System. You are helping a STAFF user (teacher/faculty).
Your capabilities include:
- Managing your assigned subjects and courses
- Taking attendance for your classes
- Creating and grading assignments
- Managing internal marks and exams
- Viewing student performance in your subjects
- Creating notices and announcements for your students
- Accessing your timetable and schedule

Be professional, helpful, and focused on educational tasks. You cannot access admin-level functions.`,

      STUDENT: `You are an AI assistant for a Campus Management System. You are helping a STUDENT user.
Your capabilities include:
- Viewing your grades and academic performance
- Checking your attendance records
- Viewing assignments and deadlines
- Accessing your timetable and schedule
- Viewing notices and announcements
- Checking exam schedules and results

Be friendly, encouraging, and focused on student success. You have limited access to personal academic data only.`
    };

    return rolePrompts[role as keyof typeof rolePrompts] || rolePrompts.STUDENT;
  }

  async generateResponse(message: string, role: string, chatHistory: ChatMessage[] = [], userId?: string): Promise<AIResponse> {
    try {
      console.log('AI Service: Generating response for role:', role);
      console.log('AI Service: Message:', message);

      // First, try to fetch specific data from database
      const dataResponse = await this.parseAndFetchData(message, role, userId);
      if (dataResponse) {
        console.log('AI Service: Database response generated successfully');
        return {
          message: dataResponse,
          role,
          timestamp: new Date()
        };
      }

      // If no specific data query, use mock responses with role-based context
      const mockResponses = {
        ADMIN: [
          "As an admin assistant, I can help you manage users, configure system settings, view reports, and handle all administrative tasks. What would you like to do?",
          "I can assist with user management, system configuration, academic setup, and generating reports. How can I help you today?",
          "Your admin capabilities include managing staff and students, configuring the system, viewing analytics, and handling notices. What specific task can I help with?"
        ],
        STAFF: [
          "As your teaching assistant, I can help with attendance management, assignment grading, creating exams, and student performance tracking. What would you like to work on?",
          "I can assist with taking attendance, managing your class schedule, creating assignments, and viewing student progress. How can I help you today?",
          "Your teaching tools include attendance tracking, assignment management, exam creation, and student analytics. What would you like to do?"
        ],
        STUDENT: [
          "Hi! I'm here to help you with your academic journey. I can show you your grades, attendance, assignments, and timetable. What would you like to know?",
          "As your study companion, I can help you check your performance, upcoming assignments, exam schedules, and academic records. How can I assist you?",
          "I can help you view your grades, attendance records, assignment deadlines, and class schedule. What information do you need?"
        ]
      };

      const responses = mockResponses[role as keyof typeof mockResponses] || mockResponses.STUDENT;
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      console.log('AI Service: Mock response generated successfully');
      return {
        message: randomResponse,
        role,
        timestamp: new Date()
      };

      // TODO: Uncomment and fix when Gemini API keys are working
      /*
      const rolePrompt = this.getRolePrompt(role);

      // Build conversation context
      const context = chatHistory
        .slice(-10) // Keep last 10 messages for context
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const fullPrompt = `${rolePrompt}

Conversation history:
${context}

Current user message: ${message}

Please provide a helpful response based on your role and capabilities.`;

      console.log('AI Service: Using model:', this.model.model);
      const result = await this.model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      console.log('AI Service: Response generated successfully');
      return {
        message: text,
        role,
        timestamp: new Date()
      };
      */
    } catch (error) {
      console.error('AI Service Error:', error);
      console.error('Error details:', error.message);
      console.error('Error status:', error.status);

      // Provide a more user-friendly error message
      let errorMessage = 'Sorry, I encountered an error while processing your request. Please try again later.';
      if (error.message?.includes('API_KEY')) {
        errorMessage = 'There seems to be an issue with the AI service configuration. Please contact support.';
      } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
        errorMessage = 'The AI service is currently at capacity. Please try again in a few minutes.';
      }

      return {
        message: errorMessage,
        role,
        timestamp: new Date()
      };
    }
  }

  // Helper method to validate if a request is appropriate for the user's role
  validateRequest(message: string, role: string): boolean {
    const lowerMessage = message.toLowerCase();

    // Admin restrictions for staff/students
    if (role !== 'ADMIN') {
      const adminOnlyKeywords = [
        'delete user', 'create user', 'system config', 'database',
        'admin panel', 'manage staff', 'manage all', 'global settings'
      ];

      if (adminOnlyKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return false;
      }
    }

    // Staff restrictions for students
    if (role === 'STUDENT') {
      const staffOnlyKeywords = [
        'grade assignment', 'take attendance', 'create exam',
        'internal marks', 'manage class', 'teacher panel'
      ];

      if (staffOnlyKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return false;
      }
    }

    return true;
  }

  // Parse user query and fetch relevant data
  private async parseAndFetchData(message: string, role: string, userId?: string): Promise<string | null> {
    const lowerMessage = message.toLowerCase();

    try {
      // Count queries
      if (this.isCountQuery(lowerMessage)) {
        return await this.handleCountQuery(lowerMessage);
      }

      // List/Show queries
      if (this.isListQuery(lowerMessage)) {
        return await this.handleListQuery(lowerMessage, role);
      }

      // Specific data queries
      if (lowerMessage.includes('attendance') || lowerMessage.includes('present') || lowerMessage.includes('absent')) {
        return await this.handleAttendanceQuery(lowerMessage, role);
      }

      if (lowerMessage.includes('grade') || lowerMessage.includes('mark') || lowerMessage.includes('gpa') || lowerMessage.includes('score')) {
        return await this.handleGradeQuery(lowerMessage, role);
      }

      if (lowerMessage.includes('timetable') || lowerMessage.includes('schedule') || lowerMessage.includes('class')) {
        return await this.handleTimetableQuery(lowerMessage, role);
      }

      if (lowerMessage.includes('assignment') || lowerMessage.includes('homework')) {
        return await this.handleAssignmentQuery(lowerMessage, role);
      }

      if (lowerMessage.includes('notice') || lowerMessage.includes('announcement')) {
        return await this.handleNoticeQuery(lowerMessage, role);
      }

      return "I'm sorry, I couldn't find the information you're looking for."; // No specific data query found
    } catch (error) {
      console.error('Error fetching data:', error);
      return "Sorry, I encountered an error while processing your request. Please try again.";
    }
  }

  // Query type detection
  private isCountQuery(message: string): boolean {
    return message.includes('how many') || message.includes('count') || message.includes('total') || message.includes('number of');
  }

  private isListQuery(message: string): boolean {
    return message.includes('list') || message.includes('show') || message.includes('display') || message.includes('get') || message.includes('all');
  }

  // Handle count queries
  private async handleCountQuery(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('student')) {
      if (lowerMessage.includes('department') || this.extractDepartmentName(message)) {
        return await this.getDepartmentStudentCount(message);
      }
      return await this.getTotalStudentCount();
    }

    if (lowerMessage.includes('staff') || lowerMessage.includes('teacher') || lowerMessage.includes('faculty')) {
      return await this.getTotalStaffCount();
    }

    if (lowerMessage.includes('department')) {
      return await this.getTotalDepartmentCount();
    }

    if (lowerMessage.includes('course') || lowerMessage.includes('subject')) {
      if (lowerMessage.includes('course')) {
        return await this.getTotalCourseCount();
      }
      return await this.getTotalSubjectCount();
    }

    if (lowerMessage.includes('assignment')) {
      return await this.getTotalAssignmentsCount();
    }

    if (lowerMessage.includes('notice') || lowerMessage.includes('announcement')) {
      return await this.getTotalNoticesCount();
    }

    return "I couldn't understand what you want to count. Try asking about students, staff, departments, courses, subjects, assignments, or notices.";
  }

  // Handle list queries
  private async handleListQuery(message: string, role: string, userId?: string): Promise<string> {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('student')) {
      if (lowerMessage.includes('department') || this.extractDepartmentName(message)) {
        return await this.listStudentsByDepartment(message);
      }
      if (role === 'STAFF' && userId) {
        return await this.listMyStudents(userId);
      }
      return await this.listAllStudents();
    }

    if (lowerMessage.includes('staff') || lowerMessage.includes('teacher') || lowerMessage.includes('faculty')) {
      return await this.listAllStaff();
    }

    if (lowerMessage.includes('department')) {
      return await this.listAllDepartments();
    }

    if (lowerMessage.includes('course')) {
      return await this.listAllCourses();
    }

    if (lowerMessage.includes('subject')) {
      if (role === 'STAFF' && userId) {
        return await this.listMySubjects(userId);
      }
      return await this.listAllSubjects();
    }

    if (lowerMessage.includes('assignment')) {
      if (role === 'STUDENT' && userId) {
        return await this.listMyAssignments(userId);
      }
      if (role === 'STAFF' && userId) {
        return await this.listMyCreatedAssignments(userId);
      }
      return await this.listAllAssignments();
    }

    if (lowerMessage.includes('notice') || lowerMessage.includes('announcement')) {
      return await this.listRecentNotices();
    }

    return "I couldn't understand what you want to list. Try asking about students, staff, departments, courses, subjects, assignments, or notices.";
  }

  // Handle personal queries (my assignments, my subjects, etc.)
  private async handlePersonalQuery(message: string, role: string, userId?: string): Promise<string> {
    if (!userId) {
      return "I need to know who you are to provide personal information.";
    }

    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('assignment')) {
      if (role === 'STUDENT') {
        return await this.listMyAssignments(userId);
      } else if (role === 'STAFF') {
        return await this.listMyCreatedAssignments(userId);
      }
    }

    if (lowerMessage.includes('subject')) {
      if (role === 'STAFF') {
        return await this.listMySubjects(userId);
      }
    }

    if (lowerMessage.includes('student')) {
      if (role === 'STAFF') {
        return await this.listMyStudents(userId);
      }
    }

    if (lowerMessage.includes('attendance')) {
      return await this.getMyAttendance(userId, role);
    }

    if (lowerMessage.includes('grade') || lowerMessage.includes('mark')) {
      return await this.getMyGrades(userId, role);
    }

    return "I couldn't understand your personal query. Try asking about your assignments, subjects, attendance, or grades.";
  }

  // Handle department-specific queries
  private async handleDepartmentQuery(message: string, role: string, userId?: string): Promise<string> {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('student')) {
      return await this.listStudentsByDepartment(message);
    }

    if (lowerMessage.includes('staff') || lowerMessage.includes('teacher')) {
      return await this.listStaffByDepartment(message);
    }

    if (lowerMessage.includes('course')) {
      return await this.listCoursesByDepartment(message);
    }

    return "I couldn't understand your department query. Try asking about students, staff, or courses in a specific department.";
  }

  // Handle attendance queries
  private async handleAttendanceQuery(message: string, role: string): Promise<string> {
    if (role === 'STUDENT') {
      return "As a student, you can view your attendance records. Would you like me to help you check your attendance percentage or records for a specific subject?";
    }
    if (role === 'STAFF') {
      return "As a staff member, you can view attendance records for your classes. Would you like me to help you check attendance for a specific subject or date?";
    }
    return "Attendance information is available for staff and students.";
  }

  // Handle grade/mark queries
  private async handleGradeQuery(message: string, role: string): Promise<string> {
    if (role === 'STUDENT') {
      return "As a student, you can view your grades and marks. Would you like me to help you check your internal marks, GPA, or results for a specific subject?";
    }
    if (role === 'STAFF') {
      return "As a staff member, you can view and manage student grades. Would you like me to help you check student performance or enter marks?";
    }
    return "Grade information is available for staff and students.";
  }

  // Handle timetable queries
  private async handleTimetableQuery(message: string, role: string): Promise<string> {
    if (role === 'STUDENT') {
      return "As a student, you can view your class timetable. Would you like me to help you check your schedule for today or this week?";
    }
    if (role === 'STAFF') {
      return "As a staff member, you can view your teaching timetable. Would you like me to help you check your classes for today or this week?";
    }
    return "Timetable information is available for staff and students.";
  }

  // Handle assignment queries
  private async handleAssignmentQuery(message: string, role: string): Promise<string> {
    if (role === 'STUDENT') {
      return "As a student, you can view your assignments. Would you like me to help you check pending assignments or submission deadlines?";
    }
    if (role === 'STAFF') {
      return "As a staff member, you can create and manage assignments. Would you like me to help you create a new assignment or check submissions?";
    }
    return "Assignment information is available for staff and students.";
  }

  // Handle notice queries
  private async handleNoticeQuery(message: string, role: string): Promise<string> {
    return await this.listRecentNotices();
  }

  // Utility methods
  private extractDepartmentName(message: string): string | null {
    const departments = ['bca', 'bsc', 'mca', 'msc', 'computer science', 'mathematics', 'physics', 'chemistry'];
    const lowerMessage = message.toLowerCase();

    for (const dept of departments) {
      if (lowerMessage.includes(dept)) {
        return dept;
      }
    }
    return null;
  }

  // Database query methods
  private async getTotalStudentCount(): Promise<string> {
    const count = await this.prisma.user.count({ where: { role: CMSUserRole.STUDENT, isActive: true } });
    return `Total active students: ${count}`;
  }

  private async getTotalStaffCount(): Promise<string> {
    const count = await this.prisma.user.count({ where: { role: CMSUserRole.STAFF, isActive: true } });
    return `Total active staff members: ${count}`;
  }

  private async getTotalDepartmentCount(): Promise<string> {
    const count = await this.prisma.department.count({ where: { status: 'ACTIVE' } });
    return `Total active departments: ${count}`;
  }

  private async getTotalCourseCount(): Promise<string> {
    const count = await this.prisma.course.count({ where: { status: 'ACTIVE' } });
    return `Total active courses: ${count}`;
  }

  private async getTotalSubjectCount(): Promise<string> {
    const count = await this.prisma.subject.count();
    return `Total subjects: ${count}`;
  }

  private async getTotalAssignmentsCount(): Promise<string> {
    const count = await this.prisma.assignment.count();
    return `Total assignments: ${count}`;
  }

  private async getTotalNoticesCount(): Promise<string> {
    const count = await this.prisma.notice.count();
    return `Total notices: ${count}`;
  }

  private async getDepartmentStudentCount(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase();

    // Try to extract department name from message
    let departmentName = '';
    if (lowerMessage.includes('bca')) departmentName = 'BCA';
    else if (lowerMessage.includes('bsc')) departmentName = 'BSC';
    else if (lowerMessage.includes('mca')) departmentName = 'MCA';
    else if (lowerMessage.includes('msc')) departmentName = 'MSC';

    if (departmentName) {
      const department = await this.prisma.department.findFirst({
        where: { name: { contains: departmentName, mode: 'insensitive' } }
      });

      if (department) {
        const count = await this.prisma.user.count({
          where: {
            role: CMSUserRole.STUDENT,
            departmentId: department.id,
            isActive: true
          }
        });
        return `Students in ${department.name} department: ${count}`;
      }
    }

    // If no specific department found, return all departments with student counts
    const departments = await this.prisma.department.findMany({
      where: { status: 'ACTIVE' },
      include: {
        _count: {
          select: { users: { where: { role: CMSUserRole.STUDENT, isActive: true } } }
        }
      }
    });

    const result = departments.map(dept =>
      `${dept.name}: ${dept._count.users} students`
    ).join('\n');

    return `Student count by department:\n${result}`;
  }

  private async getRecentRegistrations(): Promise<string> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await this.prisma.user.count({
      where: {
        createdAt: { gte: today },
        isActive: true
      }
    });

    return `New registrations today: ${count}`;
  }

  private async getAttendanceInfo(role: string): Promise<string> {
    // This would need user context to get specific attendance
    // For now, return a general message
    if (role === 'STAFF') {
      return "As a staff member, you can view attendance records for your classes. Would you like me to help you check attendance for a specific subject or date?";
    } else if (role === 'STUDENT') {
      return "As a student, you can view your attendance records. Would you like me to help you check your attendance percentage or records for a specific subject?";
    }
    return "Attendance information is available for staff and students.";
  }

  // List methods
  private async listAllStudents(): Promise<string> {
    const students = await this.prisma.user.findMany({
      where: { role: CMSUserRole.STUDENT, isActive: true },
      select: { id: true, name: true, email: true, department: { select: { name: true } } },
      take: 10 // Limit to 10 for display
    });

    if (students.length === 0) {
      return "No students found.";
    }

    const result = students.map(student =>
      `${student.name} (${student.email}) - ${student.department?.name || 'No Department'}`
    ).join('\n');

    return `Students (showing first 10):\n${result}`;
  }

  private async listStudentsByDepartment(message: string): Promise<string> {
    const departmentName = this.extractDepartmentName(message);
    if (!departmentName) {
      return await this.listAllStudents();
    }

    const department = await this.prisma.department.findFirst({
      where: { name: { contains: departmentName, mode: 'insensitive' } }
    });

    if (!department) {
      return `Department "${departmentName}" not found.`;
    }

    const students = await this.prisma.user.findMany({
      where: {
        role: CMSUserRole.STUDENT,
        departmentId: department.id,
        isActive: true
      },
      select: { id: true, name: true, email: true },
      take: 10
    });

    if (students.length === 0) {
      return `No students found in ${department.name} department.`;
    }

    const result = students.map(student =>
      `${student.name} (${student.email})`
    ).join('\n');

    return `Students in ${department.name} department (showing first 10):\n${result}`;
  }

  private async listAllStaff(): Promise<string> {
    const staff = await this.prisma.user.findMany({
      where: { role: CMSUserRole.STAFF, isActive: true },
      select: { id: true, name: true, email: true, department: { select: { name: true } } },
      take: 10
    });

    if (staff.length === 0) {
      return "No staff members found.";
    }

    const result = staff.map(member =>
      `${member.name} (${member.email}) - ${member.department?.name || 'No Department'}`
    ).join('\n');

    return `Staff members (showing first 10):\n${result}`;
  }

  private async listAllDepartments(): Promise<string> {
    const departments = await this.prisma.department.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true }
    });

    if (departments.length === 0) {
      return "No departments found.";
    }

    const result = departments.map(dept => dept.name).join('\n');
    return `Departments:\n${result}`;
  }

  private async listAllCourses(): Promise<string> {
    const courses = await this.prisma.course.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, title: true, code: true, department: { select: { name: true } } },
      take: 10
    });

    if (courses.length === 0) {
      return "No courses found.";
    }

    const result = courses.map(course =>
      `${course.title} (${course.code}) - ${course.department?.name || 'No Department'}`
    ).join('\n');

    return `Courses (showing first 10):\n${result}`;
  }

  private async listAllSubjects(): Promise<string> {
    const subjects = await this.prisma.subject.findMany({
      select: { id: true, name: true, code: true, department: { select: { name: true } } },
      take: 10
    });

    if (subjects.length === 0) {
      return "No subjects found.";
    }

    const result = subjects.map(subject =>
      `${subject.name} (${subject.code}) - ${subject.department?.name || 'No Department'}`
    ).join('\n');

    return `Subjects (showing first 10):\n${result}`;
  }

  private async listAllAssignments(): Promise<string> {
    const assignments = await this.prisma.assignment.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        dueDate: true,
        subject: { select: { name: true } },
        author: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    if (assignments.length === 0) {
      return "No assignments found.";
    }

    const result = assignments.map(assignment =>
      `${assignment.title} - ${assignment.subject?.name || 'No Subject'} - Due: ${assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}`
    ).join('\n');

    return `Recent assignments (showing first 10):\n${result}`;
  }

  private async listRecentNotices(): Promise<string> {
    const notices = await this.prisma.notice.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    if (notices.length === 0) {
      return "No notices found.";
    }

    const result = notices.map(notice =>
      `${notice.title} - ${new Date(notice.createdAt).toLocaleDateString()} by ${notice.author?.name || 'Unknown'}`
    ).join('\n');

    return `Recent notices:\n${result}`;
  }

  // List students for a staff member (students in the same department)
  private async listMyStudents(userId: string): Promise<string> {
    try {
      const staff = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { departmentId: true, department: { select: { name: true } } }
      });

      if (!staff?.departmentId) {
        return "Your department information is not available.";
      }

      const students = await this.prisma.user.findMany({
        where: {
          role: CMSUserRole.STUDENT,
          departmentId: staff.departmentId,
          isActive: true
        },
        select: { id: true, name: true, email: true },
        take: 20
      });

      if (students.length === 0) {
        return "No students found in your department.";
      }

      let response = `Students in ${staff.department?.name || 'your department'} (${students.length} total):\n\n`;
      students.forEach(student => {
        response += `• ${student.name} (${student.email})\n`;
      });

      return response;
    } catch (error) {
      console.error('Error fetching my students:', error);
      return "Sorry, I couldn't fetch your students at the moment.";
    }
  }

  // List subjects for a staff member
  private async listMySubjects(userId: string): Promise<string> {
    try {
      const staffSubjects = await this.prisma.staffSubject.findMany({
        where: { staffId: userId },
        include: {
          subject: { select: { name: true, code: true, department: { select: { name: true } } } }
        }
      });

      if (staffSubjects.length === 0) {
        return "You don't have any subjects assigned to you yet.";
      }

      let response = `You are teaching ${staffSubjects.length} subjects:\n\n`;
      staffSubjects.forEach(staffSubject => {
        response += `• ${staffSubject.subject.name} (${staffSubject.subject.code}) - ${staffSubject.subject.department.name}\n`;
      });

      return response;
    } catch (error) {
      console.error('Error fetching my subjects:', error);
      return "Sorry, I couldn't fetch your subjects at the moment.";
    }
  }

  // List assignments for a student
  private async listMyAssignments(userId: string): Promise<string> {
    try {
      const student = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { departmentId: true }
      });

      if (!student?.departmentId) {
        return "Your department information is not available.";
      }

      const assignments = await this.prisma.assignment.findMany({
        where: { departmentId: student.departmentId },
        include: {
          subject: { select: { name: true, code: true } },
          author: { select: { name: true } }
        },
        orderBy: { dueDate: 'asc' }
      });

      if (assignments.length === 0) {
        return "No assignments found for your department.";
      }

      let response = `You have ${assignments.length} assignments:\n\n`;
      assignments.forEach(assignment => {
        const dueDate = new Date(assignment.dueDate).toLocaleDateString();
        response += `• ${assignment.title} (${assignment.subject?.name || 'General'})\n`;
        response += `  Due: ${dueDate}\n`;
        response += `  Teacher: ${assignment.author.name}\n\n`;
      });

      return response;
    } catch (error) {
      console.error('Error fetching my assignments:', error);
      return "Sorry, I couldn't fetch your assignments at the moment.";
    }
  }

  // List assignments created by a staff member
  private async listMyCreatedAssignments(userId: string): Promise<string> {
    try {
      const assignments = await this.prisma.assignment.findMany({
        where: { authorId: userId },
        include: {
          subject: { select: { name: true, code: true } },
          department: { select: { name: true } }
        },
        orderBy: { dueDate: 'asc' }
      });

      if (assignments.length === 0) {
        return "You haven't created any assignments yet.";
      }

      let response = `You have created ${assignments.length} assignments:\n\n`;
      assignments.forEach(assignment => {
        const dueDate = new Date(assignment.dueDate).toLocaleDateString();
        response += `• ${assignment.title} (${assignment.subject?.name || 'General'} - ${assignment.department.name})\n`;
        response += `  Due: ${dueDate}\n\n`;
      });

      return response;
    } catch (error) {
      console.error('Error fetching my created assignments:', error);
      return "Sorry, I couldn't fetch your assignments at the moment.";
    }
  }

  // Get personal attendance information
  private async getMyAttendance(userId: string, role: string): Promise<string> {
    try {
      if (role === 'STUDENT') {
        const attendanceRecords = await this.prisma.attendanceRecord.findMany({
          where: { studentId: userId },
          include: {
            session: {
              include: {
                subject: { select: { name: true } }
              }
            }
          },
          orderBy: { markedAt: 'desc' },
          take: 10
        });

        if (attendanceRecords.length === 0) {
          return "No attendance records found.";
        }

        const presentCount = attendanceRecords.filter(a => a.status === 'PRESENT').length;
        const totalCount = attendanceRecords.length;
        const percentage = Math.round((presentCount / totalCount) * 100);

        let response = `Your attendance summary (last ${totalCount} records):\n`;
        response += `Present: ${presentCount}/${totalCount} (${percentage}%)\n\n`;
        response += `Recent records:\n`;

        attendanceRecords.forEach(record => {
          const date = new Date(record.markedAt).toLocaleDateString();
          response += `${date} - ${record.session.subject?.name || 'Unknown Subject'}: ${record.status}\n`;
        });

        return response;
      } else if (role === 'STAFF') {
        return "As a staff member, you can view attendance records for your classes. Would you like me to help you check attendance for a specific subject or date?";
      }

      return "Attendance information is available for staff and students.";
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return "Sorry, I couldn't fetch your attendance information at the moment.";
    }
  }

  // Get personal grades/marks
  private async getMyGrades(userId: string, role: string): Promise<string> {
    try {
      if (role === 'STUDENT') {
        const internalMarks = await this.prisma.internalMark.findMany({
          where: { studentId: userId },
          include: {
            subject: { select: { name: true, code: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        });

        if (internalMarks.length === 0) {
          return "No grade records found.";
        }

        let response = `Your recent grades:\n\n`;
        internalMarks.forEach(mark => {
          response += `• ${mark.subject.name} (${mark.assessmentType})\n`;
          response += `  Marks: ${mark.marks}/${mark.maxMarks}\n`;
          response += `  Percentage: ${Math.round((mark.marks / mark.maxMarks) * 100)}%\n\n`;
        });

        return response;
      } else if (role === 'STAFF') {
        return "As a staff member, you can view and manage student grades. Would you like me to help you check grades for a specific subject or student?";
      }

      return "Grade information is available for staff and students.";
    } catch (error) {
      console.error('Error fetching grades:', error);
      return "Sorry, I couldn't fetch your grade information at the moment.";
    }
  }

  // List staff by department
  private async listStaffByDepartment(message: string): Promise<string> {
    const departmentName = this.extractDepartmentName(message);
    if (!departmentName) {
      return await this.listAllStaff();
    }

    const department = await this.prisma.department.findFirst({
      where: { name: { contains: departmentName, mode: 'insensitive' } }
    });

    if (!department) {
      return `Department "${departmentName}" not found.`;
    }

    const staff = await this.prisma.user.findMany({
      where: {
        role: CMSUserRole.STAFF,
        departmentId: department.id,
        isActive: true
      },
      select: { id: true, name: true, email: true },
      take: 10
    });

    if (staff.length === 0) {
      return `No staff members found in ${department.name} department.`;
    }

    const result = staff.map(member =>
      `${member.name} (${member.email})`
    ).join('\n');

    return `Staff members in ${department.name} department (showing first 10):\n${result}`;
  }

  // List courses by department
  private async listCoursesByDepartment(message: string): Promise<string> {
    const departmentName = this.extractDepartmentName(message);
    if (!departmentName) {
      return await this.listAllCourses();
    }

    const department = await this.prisma.department.findFirst({
      where: { name: { contains: departmentName, mode: 'insensitive' } }
    });

    if (!department) {
      return `Department "${departmentName}" not found.`;
    }

    const courses = await this.prisma.course.findMany({
      where: {
        departmentId: department.id,
        status: 'ACTIVE'
      },
      select: { id: true, title: true, code: true },
      take: 10
    });

    if (courses.length === 0) {
      return `No courses found in ${department.name} department.`;
    }

    const result = courses.map(course =>
      `${course.title} (${course.code})`
    ).join('\n');

    return `Courses in ${department.name} department (showing first 10):\n${result}`;
  }
}