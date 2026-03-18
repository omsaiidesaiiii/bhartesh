import { Controller, Post, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { AIService, ChatMessage, AIResponse } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CMSUserRole } from '@prisma/client';
import { Request } from 'express';

interface ChatRequest {
  message: string;
  chatHistory?: ChatMessage[];
}

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('chat')
  @Roles(CMSUserRole.ADMIN, CMSUserRole.STAFF, CMSUserRole.STUDENT)
  async chat(@Body() body: ChatRequest, @Req() req: Request): Promise<AIResponse> {
    const user = req.user as any;
    const { message, chatHistory = [] } = body;

    if (!message || message.trim().length === 0) {
      throw new BadRequestException('Message cannot be empty');
    }

    // Validate request based on user role
    if (!this.aiService.validateRequest(message, user.role)) {
      throw new BadRequestException('This request is not allowed for your role');
    }

    return this.aiService.generateResponse(message, user.role, chatHistory, user.id);
  }
}