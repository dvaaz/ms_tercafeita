import { All, Controller, NotFoundException, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { GatewayService } from '../services/gateway.service';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @All('*')
  async handleGateway(@Req() req: Request, @Res() res: Response) {
    if (req.path.startsWith('/gateway')) {
      throw new NotFoundException('Rota interna do gateway não encontrada.');
    }
    const result = await this.gatewayService.processRequest(
      req.method,
      req.path,
      req.headers,
      req.body,
      req.query,
      req.ip,
    );

    return res.status(200).json(result);
  }
}