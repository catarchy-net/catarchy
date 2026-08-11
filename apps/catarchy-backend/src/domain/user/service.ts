import { NotFoundError } from "@/lib/error";

import { UserRepository } from "./repository";

export abstract class UserService {
  // Repositories
  private static userRepository = UserRepository;

  static async getCurrentUser({ id }: { id: string }) {
    const [user, auth, remiliaAuth] = await Promise.all([
      this.userRepository.findById({ id }),
      this.userRepository.findAuthByUserId({ userId: id }),
      this.userRepository.findRemiliaAuthByUserId({ userId: id }),
    ]);

    if (!user || !auth) {
      throw new NotFoundError("User not found");
    }

    return {
      id: user.id,
      handle: user.handle,
      email: auth.email,
      remiliaNickname:
        remiliaAuth?.remiliaDisplayName ?? remiliaAuth?.remiliaUsername ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
