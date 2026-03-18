import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FcmModule } from './fcm/fcm.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { SetupModule } from './setup/setup.module';
import { ProfileModule } from './profile/profile.module';
import { StaffModule } from './staff/staff.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TimetableModule } from './timetable/timetable.module';
import { HodModule } from './hod/hod.module';
import { AcademicYearModule } from './academic-year/academic-year.module';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { InternalMarksModule } from './internal-marks/internal-marks.module';
import { AttendanceModule } from './attendance/attendance.module';
import { NoticesModule } from './notices/notices.module';
import { ExamsModule } from './exams/exams.module';
import { ReportsModule } from './reports/reports.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { MailModule } from './mail/mail.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AIModule } from './ai/ai.module';
import { CourseModule } from './course/course.module';

@Module({
  imports: [
    MailModule,
    FcmModule,
    AuthModule,
    PrismaModule,
    SetupModule,
    ProfileModule,
    StaffModule,
    SubjectsModule,
    TimetableModule,
    HodModule,
    AcademicYearModule,
    EventsModule,
    UsersModule,
    StudentsModule,
    InternalMarksModule,
    AttendanceModule,
    NoticesModule,
    ExamsModule,
    ReportsModule,
    AssignmentsModule,
    DashboardModule,
    AIModule,
    CourseModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
