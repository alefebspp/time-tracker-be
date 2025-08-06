import User from "../user.model";

export default interface UserRepository {
  create: (
    data: Pick<User, "email" | "name"> & { password: string }
  ) => Promise<void>;
  findById: (id: string) => Promise<User | null>;
  findByEmail: (email: string) => Promise<User | null>;
}
