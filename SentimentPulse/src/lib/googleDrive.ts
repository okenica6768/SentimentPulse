
interface UserData {
  userId: string
  trackedAssets: string[]
  preferences: any
  subscription: any
  alerts: any[]
  timestamp: string
}

class GoogleDriveService {
  private userEmail = 'aronoke69@gmail.com'
  private storagePrefix = 'sentimentpulse_gdrive_'

  async initialize() {
    console.log(`Initialized storage for ${this.userEmail}`)
    return Promise.resolve()
  }

  private getStorageKey(userId: string): string {
    return `${this.storagePrefix}${userId}`
  }

  async saveUserData(userId: string, data: Partial<UserData>) {
    try {
      const userData: UserData = {
        userId,
        trackedAssets: data.trackedAssets || [],
        preferences: data.preferences || {},
        subscription: data.subscription || null,
        alerts: data.alerts || [],
        timestamp: new Date().toISOString()
      }

      const storageKey = this.getStorageKey(userId)
      localStorage.setItem(storageKey, JSON.stringify(userData))
      
      // Also save to a backup key for redundancy
      localStorage.setItem(`${storageKey}_backup`, JSON.stringify(userData))
      
      console.log(`Data saved for ${this.userEmail} (${userId})`)
    } catch (error) {
      console.error('Failed to save user data:', error)
      throw error
    }
  }

  async loadUserData(userId: string): Promise<Partial<UserData> | null> {
    try {
      const storageKey = this.getStorageKey(userId)
      const data = localStorage.getItem(storageKey)
      
      if (data) {
        const parsed = JSON.parse(data)
        console.log(`Data loaded for ${this.userEmail} (${userId})`)
        return parsed
      }

      // Try backup if main data doesn't exist
      const backupData = localStorage.getItem(`${storageKey}_backup`)
      if (backupData) {
        const parsed = JSON.parse(backupData)
        console.log(`Backup data loaded for ${this.userEmail} (${userId})`)
        return parsed
      }

      return null
    } catch (error) {
      console.error('Failed to load user data:', error)
      return null
    }
  }

  async syncTrackedAssets(userId: string, trackedAssets: string[]) {
    const userData = await this.loadUserData(userId) || {}
    userData.trackedAssets = [...new Set(trackedAssets)] // Remove duplicates
    await this.saveUserData(userId, userData)
    console.log(`Synced ${trackedAssets.length} tracked assets for ${this.userEmail}`)
  }

  async syncPreferences(userId: string, preferences: any) {
    const userData = await this.loadUserData(userId) || {}
    userData.preferences = preferences
    await this.saveUserData(userId, userData)
    console.log(`Synced preferences for ${this.userEmail}`)
  }

  async syncSubscription(userId: string, subscription: any) {
    const userData = await this.loadUserData(userId) || {}
    userData.subscription = subscription
    await this.saveUserData(userId, userData)
    console.log(`Synced subscription for ${this.userEmail}`)
  }

  async clearUserData(userId: string) {
    const storageKey = this.getStorageKey(userId)
    localStorage.removeItem(storageKey)
    localStorage.removeItem(`${storageKey}_backup`)
    console.log(`Cleared data for ${this.userEmail} (${userId})`)
  }

  async exportUserData(userId: string): Promise<string | null> {
    const data = await this.loadUserData(userId)
    if (data) {
      return JSON.stringify(data, null, 2)
    }
    return null
  }

  async importUserData(userId: string, jsonData: string) {
    try {
      const data = JSON.parse(jsonData)
      await this.saveUserData(userId, data)
      console.log(`Imported data for ${this.userEmail} (${userId})`)
    } catch (error) {
      console.error('Failed to import user data:', error)
      throw error
    }
  }
}

export const googleDriveService = new GoogleDriveService()
