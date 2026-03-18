const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const staff = await prisma.user.findMany({
        where: { role: 'STAFF' },
        select: {
            id: true,
            name: true,
            email: true,
            _count: {
                select: {
                    staffSubjects: true,
                    timetables: true,
                }
            }
        }
    });
    console.log('--- Staff List ---');
    console.log(JSON.stringify(staff, null, 2));

    const timetables = await prisma.timeTable.findMany({
        select: {
            id: true,
            staffId: true,
            dayOfWeek: true,
        }
    });
    console.log('--- All Timetables ---');
    console.log(JSON.stringify(timetables, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
