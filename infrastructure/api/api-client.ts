const API_BASE_URL = "http://192.168.50.180:666"
const DEFAULT_USER_EMAIL = "jimm0063@gmail.com"

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`GET ${endpoint} failed:`, response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      return response.json()
    } catch (error) {
      console.error(`API GET request failed for ${endpoint}:`, error)
      throw error
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`POST ${endpoint} failed:`, response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      return response.json()
    } catch (error) {
      console.error(`API POST request failed for ${endpoint}:`, error)
      throw error
    }
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`PUT ${endpoint} failed:`, response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      return response.json()
    } catch (error) {
      console.error(`API PUT request failed for ${endpoint}:`, error)
      throw error
    }
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`PATCH ${endpoint} failed:`, response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      return response.json()
    } catch (error) {
      console.error(`API PATCH request failed for ${endpoint}:`, error)
      throw error
    }
  }

  async delete(endpoint: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`DELETE ${endpoint} failed:`, response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
    } catch (error) {
      console.error(`API DELETE request failed for ${endpoint}:`, error)
      throw error
    }
  }

  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<T> {
    const formData = new FormData()
    formData.append("file", file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()
export { DEFAULT_USER_EMAIL }
