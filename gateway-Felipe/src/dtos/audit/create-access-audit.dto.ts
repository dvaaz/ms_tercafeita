export class CreateAccessAuditDto {
  userId!: string;
  action!: string;
  resource!: string;
  details?: string | null;
  ip?: string | null;
}