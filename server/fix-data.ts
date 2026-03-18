
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fix() {
    try {
        console.log('Fixing department-less students...');

        // Get first department
        const dept = await prisma.department.findFirst();
        if (!dept) {
            console.log('No departments found to assign!');
            return;
        }

        const result = await prisma.user.updateMany({
            where: {
                role: 'STUDENT',
                departmentId: null
            },
            data: {
                departmentId: dept.id
            }
        });

        console.log(`Updated ${result.count} students with department: ${dept.name}`);

        // Also ensure some subjects exist
        const subjects = await prisma.subject.count();
        if (subjects === 0) {
            console.log('Creating sample subjects...');
            await prisma.subject.createMany({
                data: [
                    { name: 'Computer Science 101', code: 'CS101', credits: 4, semester: 1, departmentId: dept.id },
                    { name: 'Mathematics I', code: 'MA101', credits: 4, semester: 1, departmentId: dept.id },
                    { name: 'Physics I', code: 'PH101', credits: 4, semester: 1, departmentId: dept.id }
                ]
            });
            console.log('Sample subjects created');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

fix();
