// Helper function to check if backend is accessible
export async function checkBackendHealth() {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.ok
  } catch (error) {
    console.error('Backend health check failed:', error)
    return false
  }
}

// Helper to get user-friendly error messages
export function getErrorMessage(error, defaultMessage = 'Request failed') {
  if (!error) return defaultMessage
  
  const errorMessage = error.message || error.toString()
  
  // Network errors
  if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
    return 'Cannot connect to server. Please ensure the backend is running on http://localhost:3000'
  }
  
  // CORS errors
  if (errorMessage.includes('CORS') || errorMessage.includes('cross-origin')) {
    return 'CORS error. Please check backend CORS configuration.'
  }
  
  // Authentication errors
  if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
    return 'Authentication failed. Please log in again.'
  }
  
  // Permission errors
  if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
    return 'You do not have permission to access this resource.'
  }
  
  // Server errors
  if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
    return 'Server error. Please check backend logs.'
  }
  
  // Return the original message if it's already user-friendly
  return errorMessage || defaultMessage
}

