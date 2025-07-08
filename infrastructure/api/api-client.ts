export const DEFAULT_USER_EMAIL = "test@example.com"

// Get API base URL from environment variable or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.50.180:666"

class ApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = API_BASE_URL
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`API GET error for ${endpoint}:`, error)
      throw error
    }
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      return responseData
    } catch (error) {
      console.error(`API POST error for ${endpoint}:`, error)
      throw error
    }
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      return responseData
    } catch (error) {
      console.error(`API PATCH error for ${endpoint}:`, error)
      throw error
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Handle empty response for DELETE operations
      const text = await response.text()
      return text ? JSON.parse(text) : ({} as T)
    } catch (error) {
      console.error(`API DELETE error for ${endpoint}:`, error)
      throw error
    }
  }

  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<T> {
    try {
      const formData = new FormData()
      formData.append("file", file)

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value)
        })
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error(`API upload error for ${endpoint}:`, error)
      throw error
    }
  }

  getBaseURL(): string {
    return this.baseURL
  }
}

export const apiClient = new ApiClient()
