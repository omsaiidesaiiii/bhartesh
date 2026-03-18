
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    try {
        console.log('--- SUBJECT DATA DIAGNOSTIC ---');

        // Get departments
        const departments = await prisma.department.findMany();
        console.log('Departments:', departments.map(d => ({ name: d.name, id: d.id })));

        // Get count of subjects per department and semester
        const subjects = await prisma.subject.groupBy({
            by: ['departmentId', 'semester'],
            _count: true
        });

        console.log('Subject Distribution:', subjects);

        // Check a sample student
        const student = await prisma.user.findFirst({
            where: { role: 'STUDENT' },
            include: { profile: true, department: true }
        });

        if (student) {
            console.log('Sample Student:', {
                name: student.name,
                dept: student.department?.name,
                deptId: student.departmentId,
                semester: student.profile?.semester
            });

            if (student.departmentId && student.profile?.semester) {
                const availableSubjects = await prisma.subject.findMany({
                    where: {
                        departmentId: student.departmentId,
                        semester: student.profile.semester
                    }
                });
                console.log(`Available subjects for this student (Sem ${student.profile.semester}):`, availableSubjects.length);
                availableSubjects.forEach(s => console.log(` - ${s.name} (${s.code})`));
            }
        } else {
            console.log('No students found');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
