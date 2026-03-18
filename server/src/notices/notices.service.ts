import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/create-notice.dto';
import { NoticeAudience, CMSUserRole } from '@prisma/client';
import { FcmService } from '../fcm/fcm.service';

@Injectable()
export class NoticesService {
    private readonly logger = new Logger(NoticesService.name);

    constructor(
        private prisma: PrismaService,
        private fcmService: FcmService
    ) { }

    async create(data: CreateNoticeDto, authorId: string) {
        const notice = await this.prisma.notice.create({
            data: {
                ...data,
                authorId,
            },
            include: {
                author: {
                    select: {
                        name: true,
                        role: true,
                    }
                }
            }
        });

        // Send FCM notifications asynchronously
        this.sendNoticeNotifications(notice).catch(err => {
            this.logger.error(`Failed to send notifications for notice ${notice.id}: ${err.message}`, err.stack);
        });

        return notice;
    }

    private async sendNoticeNotifications(notice: any) {
        try {
            this.logger.log(`Starting notification process for notice: ${notice.title}`);

            const whereClause: any = { isActive: true };

            if (notice.audience === NoticeAudience.STAFF) {
                whereClause.role = CMSUserRole.STAFF;
            } else if (notice.audience === NoticeAudience.STUDENTS) {
                whereClause.role = CMSUserRole.STUDENT;
            }
            // For ALL, we don't add role filter

            const users = await this.prisma.user.findMany({
                where: whereClause,
                select: { id: true }
            });

            const userIds = users.map(u => u.id);

            if (userIds.length === 0) {
                this.logger.warn(`No users found for notice audience: ${notice.audience}`);
                return;
            }

            await this.fcmService.sendNotificationToMultipleUsers(
                userIds,
                {
                    title: `New Notice: ${notice.title}`,
                    body: notice.content.length > 100
                        ? notice.content.substring(0, 97) + '...'
                        : notice.content,
                    click_action: `/notices/${notice.id}`,
                    data: {
                        type: 'NOTICE',
                        noticeId: notice.id,
                        audience: notice.audience
                    }
                },
                notice.authorId
            );

            this.logger.log(`Notifications triggered for ${userIds.length} users for notice ${notice.id}`);
        } catch (error) {
            this.logger.error(`Error in sendNoticeNotifications: ${error.message}`, error.stack);
        }
    }

    async findAll(audience?: NoticeAudience, page: number = 1, limit: number = 10, search?: string) {
        const skip = (page - 1) * limit;
        
        const whereClause: any = {};
        
        if (audience) {
            whereClause.OR = [
                { audience: NoticeAudience.ALL },
                { audience },
            ];
        }

        if (search) {
            const searchFilter = {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { content: { contains: search, mode: 'insensitive' } },
                ]
            };
            
            if (whereClause.OR) {
                // If we already have an OR for audience, we need to AND it with the search OR
                const audienceOr = whereClause.OR;
                delete whereClause.OR;
                whereClause.AND = [
                    { OR: audienceOr },
                    searchFilter
                ];
            } else {
                whereClause.OR = searchFilter.OR;
            }
        }

        const [total, notices] = await Promise.all([
            this.prisma.notice.count({ where: whereClause }),
            this.prisma.notice.findMany({
                where: whereClause,
                orderBy: [
                    { pinned: 'desc' },
                    { createdAt: 'desc' },
                ],
                skip,
                take: Number(limit),
                include: {
                    author: {
                        select: {
                            name: true,
                            role: true,
                        }
                    }
                }
            })
        ]);

        return {
            notices,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit)
        };
    }

    async findOne(id: string) {
        return this.prisma.notice.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        name: true,
                        role: true,
                    }
                }
            }
        });
    }

    async update(id: string, data: UpdateNoticeDto) {
        return this.prisma.notice.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.notice.delete({
            where: { id },
        });
    }

    async togglePin(id: string) {
        const notice = await this.prisma.notice.findUnique({ where: { id } });
        if (!notice) {
            throw new Error('Notice not found');
        }
        return this.prisma.notice.update({
            where: { id },
            data: { pinned: !notice.pinned }
        });
    }
}
