import User from "../user.model";

export type CreateUserParams = Pick<User, "email" | "name"> & {
  password: string;
};
