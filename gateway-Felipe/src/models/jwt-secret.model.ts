export class JwtSecret {
  id: string;
  name: string;
  secret: string;
  isActive: boolean;  
  createdAt: Date;
  updatedAt: Date;

  constructor(data: JwtSecret){
    this.id = data.id;
    this.name = data.name;
    this.secret = data.secret;
    this.isActive = data.isActive;    
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}