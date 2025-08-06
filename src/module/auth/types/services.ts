import User from "@/module/user/user.model";

export type LoginRequestParams = {
  email: string;
  password: string;
};

export type RegisterUserParams = Pick<User, "email" | "name"> & {
  password: string;
};
