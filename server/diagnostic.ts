
import { PrismaClient } from '@prisma/client';
import { StudentsService } from './src/students/students.service';

const prisma = new PrismaClient();
const service = new StudentsService(prisma as any, null as any);

async function check() {
    try {
        const result = await service.findAll(1, 10);
        console.log('--- API RESPONSE STRUCTURE ---');
        console.log(JSON.stringify(result, null, 2));
        console.log('------------------------------');
    } catch (err) {
        console.error('Service error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
