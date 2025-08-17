import User from "../user.model";

export type CreateUserParams = Pick<User, "email" | "name" | "companyId"> & {
  password: string;
};

export type UserService = {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User>;
  create(params: CreateUserParams): Promise<User>;
};
