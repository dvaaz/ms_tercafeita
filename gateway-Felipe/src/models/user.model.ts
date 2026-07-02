export class User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: User){
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}