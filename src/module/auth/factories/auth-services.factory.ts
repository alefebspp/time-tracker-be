import UserRepository, {
  CreateUserDTO,
} from "@/module/user/repository/user.repository";
import { login, LoginDTO } from "../services/login.service";
import { registerUser } from "../services/register.service";
import getProfile from "../services/get-profile.service";

export function makeRegisterService(userRepository: UserRepository) {
  return async function registerUserWithRepo(data: CreateUserDTO) {
    return registerUser(userRepository, data);
  };
}

export function makeLoginService(userRepository: UserRepository) {
  return async function loginWithRepo(data: LoginDTO) {
    return login(userRepository, data);
  };
}

export function makeGetProfileService(userRepository: UserRepository) {
  return async function getProfileWithRepo(id: string) {
    return getProfile(userRepository, id);
  };
}
