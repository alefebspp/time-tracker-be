import { randomUUID } from "crypto";
import User from "../user.model";
import UserRepository, { CreateUserDTO } from "./user.repository";

export type InMemoryUserRepository = UserRepository & { users: User[] };

export default function makeInMemoryUserRepository(): InMemoryUserRepository {
  const users: User[] = [];

  return {
    users,
    async create(data: CreateUserDTO) {
      users.push({
        ...data,
        id: randomUUID(),
        passwordHash: data.password,
        createdAt: new Date(),
      });
    },

    async findById(id: string) {
      const user = users.find((user) => id === user.id) || null;

      return user;
    },

    async findByEmail(email: string) {
      const user = users.find((user) => email === user.email) || null;

      return user;
    },
  };
}
