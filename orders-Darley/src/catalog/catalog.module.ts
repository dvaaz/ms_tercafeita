import { Global, Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CatalogService } from "./catalog.service";

@Global()
@Module({
  providers: [CatalogService, PrismaService],
  exports: [CatalogService],
})
export class CatalogModule {}
