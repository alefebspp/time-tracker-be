export default interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  companyId: string;
  createdAt: Date;
  updatedAt?: Date | null;
  roles: {
    id: string;
    userId: string;
    roleId: string;
    role: {
      id: string;
      name: string;
    };
  }[];
}
