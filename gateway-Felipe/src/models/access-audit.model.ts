export class AccessAudit {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details?: string | null;
  ip?: string | null;
  createdAt: Date;

  constructor(data: AccessAudit){
    this.id = data.id;
    this.userId = data.userId;
    this.action = data.action;
    this.resource = data.resource;
    this.details = data.details;
    this.ip = data.ip;
    this.createdAt = data.createdAt;
  }
}