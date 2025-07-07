import type { User } from "../entities/user"

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>
  create(user: Omit<User, "createdAt" | "updatedAt">): Promise<User>
  update(email: string, user: Partial<User>): Promise<User>
}
