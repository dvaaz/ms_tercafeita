export class RefreshToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;

  constructor(data: RefreshToken){
    this.id = data.id;
    this.token = data.token;
    this.userId = data.userId;
    this.expiresAt = data.expiresAt;
    this.createdAt = data.createdAt;
  }
}