import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { GatewayService } from '../services/gateway.service';

@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @All('*')
  async handleGateway(@Req() req: Request, @Res() res: Response) {
    const result = await this.gatewayService.processRequest(
      req.method,
      req.path.replace('/gateway', ''),
      req.headers,
      req.body,
      req.query,
      req.ip,
    );

    return res.status(200).json(result);
  }
}