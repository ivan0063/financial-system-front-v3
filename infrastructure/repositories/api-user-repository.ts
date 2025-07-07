import type { UserRepository } from "@/domain/repositories/user-repository"
import type { User } from "@/domain/entities/user"
import { apiClient } from "../api/api-client"

export class ApiUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    try {
      const response = await apiClient.get<any>(`/jpa/user/search/findByEmailAndActiveTrue?email=${email}`)
      return response
    } catch (error) {
      return null
    }
  }

  async create(user: Omit<User, "createdAt" | "updatedAt">): Promise<User> {
    return apiClient.post<User>("/jpa/user", user)
  }

  async update(email: string, user: Partial<User>): Promise<User> {
    // First find the user to get their ID
    const existingUser = await this.findByEmail(email)
    if (!existingUser) {
      throw new Error("User not found")
    }

    return apiClient.put<User>(`/jpa/user/${email}`, user)
  }
}

export const userRepository = new ApiUserRepository()
