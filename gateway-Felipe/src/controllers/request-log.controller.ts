import { Controller, Get, Param } from '@nestjs/common';
import { RequestLogsService } from '../services/request-logs.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('request-logs')
export class RequestLogsController {
  constructor(private readonly requestLogsService: RequestLogsService) {}

  @Get()
  async findAll() {
    return this.requestLogsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.requestLogsService.findById(id);
  }
}