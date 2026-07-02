import { AccessAudit } from 'src/models/access-audit.model';
import { CreateAccessAuditDto } from 'src/dtos/audit/create-access-audit.dto';

export interface IAccessAuditService {
  create(data: CreateAccessAuditDto): Promise<AccessAudit>;
  findAll(): Promise<AccessAudit[]>;
  findById(id: string): Promise<AccessAudit | null>;
  findByUserId(userId: string): Promise<AccessAudit[]>;
}