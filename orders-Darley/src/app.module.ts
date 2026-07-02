import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { OrdersModule } from "./orders/orders.module";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./health/health.module";
import { CatalogModule } from "./catalog/catalog.module";

@Module({
  imports: [
    PrismaModule,
    HttpModule,
    OrdersModule,
    HealthModule,
    CatalogModule,
  ],
})
export class AppModule {}
