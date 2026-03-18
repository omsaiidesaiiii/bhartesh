import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Verifying Exams & Results Module ---');

    // 1. Create a test exam
    console.log('\n1. Creating test exam...');
    const exam = await prisma.exam.create({
        data: {
            name: 'Test Final Exam',
            code: 'TEST101',
            type: 'FINAL',
            status: 'SCHEDULED',
            date: new Date(),
            startTime: new Date(),
            endTime: new Date(new Date().getTime() + 3600000), // 1 hour later
            room: 'Online',
        },
    });
    console.log('Created exam:', exam.id);

    // 2. Fetch stats
    console.log('\n2. Fetching dashboard stats...');
    const upcomingCount = await prisma.exam.count({
        where: {
            date: {
                gte: new Date(),
                lte: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
            },
        },
    });
    console.log('Upcoming exams in next 7 days:', upcomingCount);

    // 3. Update exam (publish results)
    console.log('\n3. Publishing results for exam...');
    const updatedExam = await prisma.exam.update({
        where: { id: exam.id },
        data: {
            isResultPublished: true,
            resultsPublishedAt: new Date(),
        },
    });
    console.log('Result published status:', updatedExam.isResultPublished);

    // 4. Cleanup
    console.log('\n4. Cleaning up test data...');
    await prisma.exam.delete({ where: { id: exam.id } });
    console.log('Done.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
