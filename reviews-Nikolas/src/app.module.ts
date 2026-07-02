import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ReviewsModule } from "./reviews/reviews.module";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [PrismaModule, HttpModule, ReviewsModule, HealthModule],
})
export class AppModule {}
