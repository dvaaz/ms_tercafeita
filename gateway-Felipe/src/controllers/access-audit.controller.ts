import { Controller, Get, Param } from '@nestjs/common';
import { AccessAuditsService } from 'src/services/access-audit.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Access Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('access-audits')
export class AccessAuditsController {
  constructor(private readonly accessAuditsService: AccessAuditsService) {}

  @Get()
  async findAll() {
    return this.accessAuditsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.accessAuditsService.findById(id);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.accessAuditsService.findByUserId(userId);
  }
}