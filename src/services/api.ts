// API service with placeholder functions for backend integration
export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  height?: number; // in cm
  weight?: number; // in kg
  goal?: 'loss' | 'maintenance' | 'gain';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface UserProfile {
  age: number;
  height: number;
  weight: number;
  goal: 'loss' | 'maintenance' | 'gain';
}

export interface Activity {
  id: string;
  name: string;
  caloriesPerHour: number;
  category: string;
}

// Mock data for activities
export const activities: Activity[] = [
  { id: '1', name: 'Running', caloriesPerHour: 600, category: 'Cardio' },
  { id: '2', name: 'Cycling', caloriesPerHour: 500, category: 'Cardio' },
  { id: '3', name: 'Swimming', caloriesPerHour: 550, category: 'Cardio' },
  { id: '4', name: 'Weight Training', caloriesPerHour: 300, category: 'Strength' },
  { id: '5', name: 'Yoga', caloriesPerHour: 200, category: 'Flexibility' },
  { id: '6', name: 'Dancing', caloriesPerHour: 400, category: 'Cardio' },
  { id: '7', name: 'Walking', caloriesPerHour: 300, category: 'Cardio' },
  { id: '8', name: 'Boxing', caloriesPerHour: 650, category: 'Cardio' },
];

// Offline storage utilities
const saveToOfflineStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(`offline_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Failed to save to offline storage:', error);
  }
};

const getFromOfflineStorage = (key: string) => {
  try {
    const stored = localStorage.getItem(`offline_${key}`);
    return stored ? JSON.parse(stored).data : null;
  } catch (error) {
    console.error('Failed to get from offline storage:', error);
    return null;
  }
};

// Placeholder API functions - replace with actual backend calls
export const loginUser = async (credentials: LoginCredentials): Promise<User> => {
  try {
    // Try online first
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (credentials.email === 'demo@example.com' && credentials.password === 'demo123') {
      const user = {
        id: '1',
        email: credentials.email,
        name: 'Demo User',
      };
      saveToOfflineStorage('currentUser', user);
      return user;
    }
    
    throw new Error('Invalid credentials');
  } catch (error) {
    // Fallback to offline storage if available
    const offlineUser = getFromOfflineStorage('currentUser');
    if (offlineUser && offlineUser.email === credentials.email) {
      return offlineUser;
    }
    throw error;
  }
};

export const registerUser = async (credentials: RegisterCredentials): Promise<User> => {
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = {
      id: Date.now().toString(),
      email: credentials.email,
      name: credentials.name,
    };
    
    saveToOfflineStorage('currentUser', user);
    return user;
  } catch (error) {
    // Still allow registration offline
    const user = {
      id: `offline_${Date.now()}`,
      email: credentials.email,
      name: credentials.name,
    };
    
    saveToOfflineStorage('currentUser', user);
    return user;
  }
};

export const updateUserProfile = async (profile: UserProfile): Promise<User> => {
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In real implementation, this would save to backend
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const updatedUser = { ...currentUser, ...profile };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    saveToOfflineStorage('currentUser', updatedUser);
    
    return updatedUser;
  } catch (error) {
    // Still allow updates offline
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const updatedUser = { ...currentUser, ...profile };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    saveToOfflineStorage('currentUser', updatedUser);
    
    return updatedUser;
  }
};

export const getUserProfile = async (): Promise<User | null> => {
  // Mock API call
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

// BMI calculation
export const calculateBMI = (height: number, weight: number): number => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

// Daily calorie calculation based on BMI and goal
export const calculateDailyCalories = (
  age: number,
  height: number,
  weight: number,
  goal: 'loss' | 'maintenance' | 'gain',
  gender: 'male' | 'female' = 'male'
): number => {
  // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  // Assume moderate activity level (multiply by 1.55)
  const maintenanceCalories = bmr * 1.55;
  
  // Adjust based on goal
  switch (goal) {
    case 'loss':
      return Math.round(maintenanceCalories - 500); // 500 calorie deficit
    case 'gain':
      return Math.round(maintenanceCalories + 500); // 500 calorie surplus
    default:
      return Math.round(maintenanceCalories);
  }
};

// Calculate exercise time needed for specific activities
export const calculateExerciseTime = (
  targetCalories: number,
  selectedActivities: Activity[]
): { activity: Activity; timeMinutes: number; calories: number }[] => {
  if (selectedActivities.length === 0) return [];
  
  const caloriesPerActivity = targetCalories / selectedActivities.length;
  
  return selectedActivities.map(activity => ({
    activity,
    timeMinutes: Math.round((caloriesPerActivity / activity.caloriesPerHour) * 60),
    calories: Math.round(caloriesPerActivity),
  }));
};