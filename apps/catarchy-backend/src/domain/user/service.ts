import { NotFoundError } from "../../lib/error";
import { AuthRepository } from "../auth/repository";
import { UserRepository } from "./repository";

export abstract class UserService {
  // Repositories
  private static authRepository = AuthRepository;
  private static userRepository = UserRepository;

  static async getCurrentUser({ id }: { id: string }) {
    const [user, auth] = await Promise.all([
      this.userRepository.findById({ id }),
      this.authRepository.findAuthByUserId({ userId: id }),
    ]);

    if (!user || !auth) {
      throw new NotFoundError("User not found");
    }

    return {
      id: user.id,
      handle: user.handle,
      email: auth.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
