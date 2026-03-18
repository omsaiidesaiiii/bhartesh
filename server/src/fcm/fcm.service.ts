import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getFirebaseAdmin } from '../firebase/firebase-admin.provider';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private readonly firebaseAdmin: typeof admin;

  constructor(private readonly prisma: PrismaService) {
    this.firebaseAdmin = getFirebaseAdmin(); // ✅ SAFE
  }

  /**
   * Upsert FCM token for a user
   * @param data The token data including userId, token, deviceId, and deviceType
   * @returns The created or updated token record
   */
  async upsertToken(data: {
    token: string;
    deviceId: string;
    deviceType: string;
    userId: string;
  }) {
    try {
      this.logger.log(`upsertToken called with data:`, {
        userId: data.userId,
        deviceId: data.deviceId,
        deviceType: data.deviceType,
        tokenLength: data.token.length
      });

      const { token, deviceId, deviceType, userId } = data;

      // Validate deviceType against enum
      const validDeviceTypes = [
        'ANDROID',
        'IOS',
        'WEB',
        'MAC',
        'WINDOWS',
        'LINUX',
        'DESKTOP',
        'OTHER',
      ];

      const normalizedDeviceType = deviceType.toUpperCase();
      if (!validDeviceTypes.includes(normalizedDeviceType)) {
        throw new Error(
          `Invalid device type: ${deviceType}. Must be one of: ${validDeviceTypes.join(', ')}`,
        );
      }

      // Check if token already exists for this user and device
      const existingToken = await this.prisma.userTokens.findFirst({
        where: {
          userId,
          deviceId,
        },
      });

      if (existingToken) {
        // Update existing token if it has changed
        if (existingToken.token !== token) {
          this.logger.log(
            `Updating token for user ${userId} on device ${deviceId}`,
          );
          return await this.prisma.userTokens.update({
            where: {
              id: existingToken.id,
            },
            data: {
              token,
              lastUsed: new Date(),
            },
          });
        } else {
          // Just update the lastUsed timestamp
          this.logger.log(
            `Refreshing token timestamp for user ${userId} on device ${deviceId}`,
          );
          return await this.prisma.userTokens.update({
            where: {
              id: existingToken.id,
            },
            data: {
              lastUsed: new Date(),
            },
          });
        }
      } else {
        // Check if token exists for another device of the same user
        const tokenExists = await this.prisma.userTokens.findFirst({
          where: {
            token,
            userId,
          },
        });

        if (tokenExists) {
          this.logger.warn(
            `Token already exists for user ${userId} on a different device. Updating device info.`,
          );
          // Update the existing token record with the new device info
          return await this.prisma.userTokens.update({
            where: {
              id: tokenExists.id,
            },
            data: {
              deviceId,
              deviceType: normalizedDeviceType as any,
              lastUsed: new Date(),
            },
          });
        }

        // Create new token record
        this.logger.log(
          `Creating new token for user ${userId} on device ${deviceId}`,
        );
        return await this.prisma.userTokens.create({
          data: {
            userId,
            token,
            deviceId,
            deviceType: normalizedDeviceType as any,
          },
        });
      }
    } catch (error) {
      this.logger.error(`Error upserting token: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send notification to users with a specific role
   * @param role The role name users should have
   * @param notification The notification payload to send
   * @returns Results of the notification sending
   */
  async sendNotificationToRole(
    roleId: string,
    notification: {
      title: string;
      body: string;
      click_action?: string;
      data?: Record<string, string>;
    },
    sentById?: string,
  ) {
    try {
      this.logger.log(`Sending notification to users with role: ${roleId}`);

      // Create notification history record first
      const notificationHistory = await this.prisma.notificationHistory.create({
        data: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          targetType: 'ROLE',
          targetIds: [roleId],
          sentById,
          status: 'PENDING',
        },
      });

      // Find all users with the specified role
      const users = await this.prisma.user.findMany({
        where: {
          roles: {
            some: {
              roleId: roleId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      if (!users.length) {
        this.logger.warn(`No users found with role: ${roleId}`);

        // Update notification history with failure
        await this.prisma.notificationHistory.update({
          where: { id: notificationHistory.id },
          data: {
            status: 'FAILED',
            successCount: 0,
            failureCount: 0,
          },
        });

        return { success: 0, failure: 0, usersCount: 0 };
      }

      const userIds = users.map((user) => user.id);
      const result = await this.sendNotificationToMultipleUsers(
        userIds,
        notification,
        sentById,
        notificationHistory.id,
      );

      // Update the notification history with results
      await this.prisma.notificationHistory.update({
        where: { id: notificationHistory.id },
        data: {
          status:
            result.success > 0
              ? result.failure > 0
                ? 'SENT'
                : 'SENT'
              : 'FAILED',
          successCount: result.success,
          failureCount: result.failure,
        },
      });

      return {
        ...result,
        historyId: notificationHistory.id,
      };
    } catch (error) {
      this.logger.error(
        `Error sending notification to role: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Send notification to a single user by ID
   * @param userId The user ID to send the notification to
   * @param notification The notification payload to send
   * @returns Result of the notification sending
   */
  async sendNotificationToUser(
    userId: string,
    notification: {
      title: string;
      body: string;
      click_action?: string;
      data?: Record<string, string>;
    },
    sentById?: string,
  ) {
    try {
      this.logger.log(`Sending notification to user: ${userId}`);

      // Create notification history record first
      const notificationHistory = await this.prisma.notificationHistory.create({
        data: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          targetType: 'USER',
          targetIds: [userId],
          sentById,
          status: 'PENDING',
        },
      });

      const tokens = await this.getUserTokens(userId);

      if (!tokens.length) {
        this.logger.warn(`No tokens found for user: ${userId}`);

        // Update notification history with failure
        await this.prisma.notificationHistory.update({
          where: { id: notificationHistory.id },
          data: {
            status: 'FAILED',
            successCount: 0,
            failureCount: 0,
          },
        });

        return { success: 0, failure: 0 };
      }

      const result = await this.sendNotificationToTokens(
        tokens
          .filter((t): t is { id: number; token: string; userId: string } => typeof t.userId === 'string'),
        notification,
        notificationHistory.id,
      );

      // Update the notification history with results
      await this.prisma.notificationHistory.update({
        where: { id: notificationHistory.id },
        data: {
          status:
            result.success > 0
              ? result.failure > 0
                ? 'SENT'
                : 'SENT'
              : 'FAILED',
          successCount: result.success,
          failureCount: result.failure,
        },
      });

      return {
        ...result,
        historyId: notificationHistory.id,
      };
    } catch (error) {
      this.logger.error(
        `Error sending notification to user: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Send notification to multiple users by IDs
   * @param userIds Array of user IDs to send notifications to
   * @param notification The notification payload to send
   * @returns Results of the notification sending
   */
  async sendNotificationToMultipleUsers(
    userIds: string[],
    notification: {
      title: string;
      body: string;
      click_action?: string;
      data?: Record<string, string>;
    },
    sentById?: string,
    existingNotificationId?: number,
  ) {
    try {
      this.logger.log(`Sending notification to ${userIds.length} users`);

      // Create notification history record if not provided
      let notificationHistoryId: number;

      if (existingNotificationId) {
        notificationHistoryId = existingNotificationId;
      } else {
        const notificationHistory =
          await this.prisma.notificationHistory.create({
            data: {
              title: notification.title,
              body: notification.body,
              data: notification.data || {},
              targetType: 'MULTIPLE_USERS',
              targetIds: userIds,
              sentById,
              status: 'PENDING',
            },
          });

        notificationHistoryId = notificationHistory.id;
      }

      // Get tokens for all specified users
      const tokensRecords = await this.prisma.userTokens.findMany({
        where: {
          userId: {
            in: userIds,
          },
        },
        select: {
          id: true,
          token: true,
          userId: true,
        },
      });

      if (!tokensRecords.length) {
        this.logger.warn(`No tokens found for specified users`);

        // Update notification history with failure
        await this.prisma.notificationHistory.update({
          where: { id: notificationHistoryId },
          data: {
            status: 'FAILED',
            successCount: 0,
            failureCount: 0,
          },
        });

        return { success: 0, failure: 0, usersCount: userIds.length };
      }

      // Filter out tokens where userId is null to ensure type safety
      const filteredTokens: { id: number; token: string; userId: string }[] = tokensRecords
        .filter((record): record is { id: number; token: string; userId: string } => typeof record.userId === 'string')
        .map((record) => ({
          id: record.id,
          token: record.token,
          userId: record.userId,
        }));

      const result = await this.sendNotificationToTokens(
        filteredTokens,
        notification,
        notificationHistoryId,
      );

      // Update the notification history with results
      await this.prisma.notificationHistory.update({
        where: { id: notificationHistoryId },
        data: {
          status:
            result.success > 0
              ? result.failure > 0
                ? 'SENT'
                : 'SENT'
              : 'FAILED',
          successCount: result.success,
          failureCount: result.failure,
        },
      });

      return {
        ...result,
        usersCount: userIds.length,
        historyId: notificationHistoryId,
      };
    } catch (error) {
      this.logger.error(
        `Error sending notification to multiple users: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Helper method to get tokens for a specific user
   * @param userId The user ID to get tokens for
   * @returns Array of token objects with id, token, and userId
   */
  private async getUserTokens(userId: string) {
    const tokens = await this.prisma.userTokens.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        token: true,
        userId: true,
      },
    });

    return tokens;
  }

  /**
   * Helper method to send notifications to an array of tokens
   * @param tokens Array of token objects containing id, token, and userId
   * @param notification The notification payload to send
   * @returns Results of the notification sending
   */
  private async sendNotificationToTokens(
    tokens: Array<{ id: number; token: string; userId: string }>,
    notification: {
      title: string;
      body: string;
      click_action?: string;
      data?: Record<string, string>;
    },
    notificationHistoryId: number,
  ) {
    try {
      const fcmTokens = tokens.map((t) => t.token);

      // Create delivery status records for tracking
      await this.prisma.fcmDeliveryStatus.createMany({
        data: tokens.map((token) => ({
          notificationId: notificationHistoryId,
          tokenId: token.id,
          userId: token.userId,
          status: 'PENDING',
        })),
      });

      // Format the notification for FCM
      const message: admin.messaging.MulticastMessage = {
        tokens: fcmTokens,
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.click_action && { click_action: notification.click_action }),
        },
        data: notification.data || {},
      };

      // Send the notifications
      const response = await this.firebaseAdmin.messaging().sendEachForMulticast(message);
      this.logger.log(
        `Notification sent: ${response.successCount} succeeded, ${response.failureCount} failed`,
      );

      // Handle failures and update delivery status
      await this.handleNotificationResponses(
        response.responses,
        tokens,
        notificationHistoryId,
      );

      return {
        success: response.successCount,
        failure: response.failureCount,
      };
    } catch (error) {
      this.logger.error(
        `Error sending notifications: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Handle notification responses and update delivery status
   * @param responses Array of messaging responses
   * @param tokens Array of token objects
   * @param notificationHistoryId ID of the notification history record
   */
  private async handleNotificationResponses(
    responses: admin.messaging.SendResponse[],
    tokens: Array<{ id: number; token: string; userId: string }>,
    notificationHistoryId: number,
  ) {
    const invalidTokenIds: number[] = [];
    const updatePromises: Promise<any>[] = [];

    responses.forEach((resp, idx) => {
      const token = tokens[idx];
      const deliveryStatus = {
        status: resp.success ? 'SENT' : 'FAILED',
        processedAt: new Date(),
      } as any;

      if (!resp.success) {
        const errorCode = resp.error?.code;
        deliveryStatus.errorCode = errorCode;
        deliveryStatus.errorMessage = resp.error?.message;

        // Check for token-related errors that indicate we should remove the token
        if (
          errorCode === 'messaging/invalid-registration-token' ||
          errorCode === 'messaging/registration-token-not-registered'
        ) {
          this.logger.warn(
            `Invalid token detected for user ${token.userId}: ${errorCode}. Will remove token.`,
          );
          invalidTokenIds.push(token.id);
        } else {
          this.logger.error(
            `Failed to send notification with error: ${resp.error?.message}`,
          );
        }
      }

      // Update delivery status
      updatePromises.push(
        this.prisma.fcmDeliveryStatus.updateMany({
          where: {
            notificationId: notificationHistoryId,
            tokenId: token.id,
          },
          data: deliveryStatus,
        }),
      );
    });

    // Wait for all status updates
    await Promise.all(updatePromises);

    // Delete invalid tokens if any were found
    if (invalidTokenIds.length > 0) {
      await this.prisma.userTokens.deleteMany({
        where: {
          id: {
            in: invalidTokenIds,
          },
        },
      });
      this.logger.log(
        `Removed ${invalidTokenIds.length} invalid tokens from database`,
      );
    }
  }

  /**
   * Get notification history with pagination and optional filtering
   * @param page Page number
   * @param limit Items per page
   * @param targetType Optional filter by target type
   * @returns Paginated notification history
   */
  async getNotificationHistory(
    page: number = 1,
    limit: number = 10,
    targetType?: string,
  ) {
    const skip = (page - 1) * limit;

    // Build where condition
    const where: any = {};
    if (targetType) {
      where.targetType = targetType;
    }

    const [items, totalCount] = await Promise.all([
      this.prisma.notificationHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sentAt: 'desc' },
        include: {
          sentBy: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              roles: {
                select: {
                  role: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.notificationHistory.count({ where }),
    ]);

    return {
      items,
      meta: {
        currentPage: page,
        itemCount: items.length,
        itemsPerPage: limit,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  /**
   * Get detailed information about a specific notification
   * @param id Notification ID
   * @returns Notification details including delivery status
   */
  async getNotificationDetails(id: number) {
    const notification = await this.prisma.notificationHistory.findUnique({
      where: { id },
      include: {
        sentBy: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            roles: {
              select: {
                role: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        tokens: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                roles: {
                  select: {
                    role: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            token: {
              select: {
                id: true,
                deviceType: true,
                deviceId: true,
                lastUsed: true,
              },
            },
          },
        },
      },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    // Transform the notification data to include target information
    const result: any = { ...notification };

    // Enhance with target information based on target type
    if (notification.targetType === 'ROLE') {
      const roleIds = notification.targetIds as string[];
      const roles = await this.prisma.role.findMany({
        where: {
          id: {
            in: roleIds,
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
        },
      });

      result.targetDetails = roles;
    } else if (
      notification.targetType === 'USER' ||
      notification.targetType === 'MULTIPLE_USERS'
    ) {
      const userIds = notification.targetIds as string[];
      const users = await this.prisma.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          roles: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      result.targetDetails = users;
    }

    // Group delivery results by status
    const deliveryStats = {
      PENDING: 0,
      SENT: 0,
      FAILED: 0,
    };

    notification.tokens.forEach((token) => {
      deliveryStats[token.status] = (deliveryStats[token.status] || 0) + 1;
    });

    result.deliveryStats = deliveryStats;

    return result;
  }

  /**
   * Get notification system statistics
   * @returns Statistics about notifications
   */
  async getNotificationStats() {
    try {
      const [
        totalNotifications,
        sentLast24Hours,
        sentLast7Days,
        sentLast30Days,
        byTargetType,
        byStatus,
        successCount,
        totalCount,
      ] = await Promise.all([
        // Total notifications
        this.prisma.notificationHistory.count(),

        // Sent in last 24 hours
        this.prisma.notificationHistory.count({
          where: {
            sentAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        }),

        // Sent in last 7 days
        this.prisma.notificationHistory.count({
          where: {
            sentAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),

        // Sent in last 30 days
        this.prisma.notificationHistory.count({
          where: {
            sentAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),

        // Group by target type
        this.prisma.notificationHistory.groupBy({
          by: ['targetType'],
          _count: true,
          where: {
            sentAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),

        // Group by status
        this.prisma.notificationHistory.groupBy({
          by: ['status'],
          _count: true,
          where: {
            sentAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),

        // Count successful notifications (with successCount > 0) in last 30 days
        this.prisma.notificationHistory.count({
          where: {
            successCount: {
              gt: 0,
            },
            sentAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),

        // Count total notifications in last 30 days (for calculating success rate)
        this.prisma.notificationHistory.count({
          where: {
            sentAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

      // Format target type stats
      const targetTypeStats = {};
      byTargetType.forEach((item) => {
        targetTypeStats[item.targetType] = item._count;
      });

      // Format status stats
      const statusStats = {};
      byStatus.forEach((item) => {
        statusStats[item.status] = item._count;
      });

      // Calculate success rate without using raw SQL
      const successRate =
        totalCount > 0
          ? ((successCount / totalCount) * 100).toFixed(2)
          : '0.00';

      return {
        totalNotifications,
        sentCount: successCount,
        failedCount: totalCount - successCount,
        pendingCount: statusStats['PENDING'] || 0,
        deliveryRate: parseFloat(successRate),
        recentActivity: {
          last24Hours: sentLast24Hours,
          last7Days: sentLast7Days,
          last30Days: sentLast30Days,
        },
        successRate: successRate,
        byTargetType: targetTypeStats,
        byStatus: statusStats,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching notification stats: ${error.message}`,
        error.stack,
      );
      // Return minimal stats to prevent UI from breaking
      return {
        totalNotifications: 0,
        sentCount: 0,
        failedCount: 0,
        pendingCount: 0,
        deliveryRate: 0,
        recentActivity: { last24Hours: 0, last7Days: 0, last30Days: 0 },
        successRate: '0.00',
        byTargetType: {},
        byStatus: {},
      };
    }
  }

  async getUserNotificationHistory(
    userId: string,
    page = 1,
    limit = 10,
    targetType?: string,
  ): Promise<any> {
    const skip = (page - 1) * limit;

    // Build the where clause for filtering
    const where: any = {
      OR: [
        // Direct notifications to this user
        {
          targetType: 'USER',
          targetIds: { array_contains: String(userId) },
        },
        // Notifications to multiple users that include this user
        {
          targetType: 'MULTIPLE_USERS',
          targetIds: { array_contains: String(userId) },
        },
        // Role-based notifications for roles this user has
        {
          targetType: 'ROLE',
          tokens: {
            some: {
              userId: userId,
            },
          },
        },
      ],
    };

    // Add target type filter if specified
    if (targetType) {
      where.targetType = targetType;
    }

    // Count total matching notifications for pagination metadata
    const totalCount = await this.prisma.notificationHistory.count({ where });
    console.log(`Total notifications found for user ${userId}: ${totalCount}`);

    // Get paginated notifications
    const notifications = await this.prisma.notificationHistory.findMany({
      where,
      include: {
        sentBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        tokens: {
          where: {
            userId,
          },
          select: {
            status: true,
            errorMessage: true,
            processedAt: true,
          },
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
      skip,
      take: Number(limit),
    });

    // Transform results to include user-specific delivery status
    const formattedNotifications = notifications.map((notification) => {
      // Get delivery status for this specific user
      const userDeliveryStatus =
        notification.tokens.length > 0 ? notification.tokens[0] : null;

      return {
        id: notification.id,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        targetType: notification.targetType,
        sentAt: notification.sentAt,
        createdAt: notification.createdAt,
        sentBy: notification.sentBy,
        // User-specific delivery information
        deliveryStatus: userDeliveryStatus
          ? userDeliveryStatus.status
          : 'UNKNOWN',
        deliveredAt: userDeliveryStatus ? userDeliveryStatus.processedAt : null,
        errorInfo: userDeliveryStatus?.errorMessage && {
          message: userDeliveryStatus.errorMessage,
        },
      };
    });

    return {
      data: formattedNotifications,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }
}
