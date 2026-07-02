import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { CartModule } from "./cart/cart.module";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [PrismaModule, HttpModule, CartModule, HealthModule],
})
export class AppModule {}
