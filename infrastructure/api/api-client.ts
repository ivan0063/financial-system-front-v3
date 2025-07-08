const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.50.180:666"
const DEFAULT_USER_EMAIL = "jimm0063@gmail.com"

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      console.log(`Making GET request to: ${this.baseUrl}${endpoint}`)

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors", // Explicitly set CORS mode
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`GET ${endpoint} failed:`, response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      return response.json()
    } catch (error) {
      console.error(`API GET request failed for ${endpoint}:`, error)

      // Check if it's a CORS error
      if (error instanceof TypeError && error.message === "Load failed") {
        throw new Error(
          `CORS Error: Cannot connect to API server at ${this.baseUrl}. Please check if the API server is running and configured to allow CORS requests from ${window.location.origin}`,
        )
      }

      throw error
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      console.log(`Making POST request to: ${this.baseUrl}${endpoint}`)

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
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

      if (error instanceof TypeError && error.message === "Load failed") {
        throw new Error(
          `CORS Error: Cannot connect to API server at ${this.baseUrl}. Please check if the API server is running and configured to allow CORS requests from ${window.location.origin}`,
        )
      }

      throw error
    }
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      console.log(`Making PUT request to: ${this.baseUrl}${endpoint}`)

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
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

      if (error instanceof TypeError && error.message === "Load failed") {
        throw new Error(
          `CORS Error: Cannot connect to API server at ${this.baseUrl}. Please check if the API server is running and configured to allow CORS requests from ${window.location.origin}`,
        )
      }

      throw error
    }
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    try {
      console.log(`Making PATCH request to: ${this.baseUrl}${endpoint}`)

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
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

      if (error instanceof TypeError && error.message === "Load failed") {
        throw new Error(
          `CORS Error: Cannot connect to API server at ${this.baseUrl}. Please check if the API server is running and configured to allow CORS requests from ${window.location.origin}`,
        )
      }

      throw error
    }
  }

  async delete(endpoint: string): Promise<void> {
    try {
      console.log(`Making DELETE request to: ${this.baseUrl}${endpoint}`)

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
        mode: "cors",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`DELETE ${endpoint} failed:`, response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
    } catch (error) {
      console.error(`API DELETE request failed for ${endpoint}:`, error)

      if (error instanceof TypeError && error.message === "Load failed") {
        throw new Error(
          `CORS Error: Cannot connect to API server at ${this.baseUrl}. Please check if the API server is running and configured to allow CORS requests from ${window.location.origin}`,
        )
      }

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

    try {
      console.log(`Making file upload request to: ${this.baseUrl}${endpoint}`)

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        mode: "cors",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error(`API upload request failed for ${endpoint}:`, error)

      if (error instanceof TypeError && error.message === "Load failed") {
        throw new Error(
          `CORS Error: Cannot connect to API server at ${this.baseUrl}. Please check if the API server is running and configured to allow CORS requests from ${window.location.origin}`,
        )
      }

      throw error
    }
  }

  getBaseUrl(): string {
    return this.baseUrl
  }
}

export const apiClient = new ApiClient()
export { DEFAULT_USER_EMAIL }
