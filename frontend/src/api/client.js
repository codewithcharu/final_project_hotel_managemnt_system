const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

console.log('API Base URL:', API_BASE_URL)

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  let data = null

  if (contentType.includes('application/json')) {
    try {
      data = await response.json()
    } catch (e) {
      // If JSON parsing fails, treat as text
      data = await response.text()
    }
  } else {
    data = await response.text()
  }

  // Check if backend returned an error response (even with 200 status)
  if (data && typeof data === 'object' && data.success === false) {
    const message = data.message || 'Request failed'
    throw new Error(message)
  }

  if (!response.ok) {
    // Check if data has a message field (from backend error response)
    let message = 'Request failed'

    if (data && typeof data === 'object') {
      message = data.message || data.error || JSON.stringify(data)
    } else if (typeof data === 'string' && data) {
      message = data
    } else {
      // Provide more specific error messages based on status code
      switch (response.status) {
        case 401:
          message = 'Unauthorized. Please log in again.'
          break
        case 403:
          message = 'Forbidden. You do not have permission to access this resource.'
          break
        case 404:
          message = 'Resource not found. The endpoint may not exist.'
          break
        case 500:
          message = 'Server error. Please check if the backend is running.'
          break
        case 0:
          message = 'Network error. Cannot connect to server. Is the backend running on ' + API_BASE_URL + '?'
          break
        default:
          message = response.statusText || `Request failed with status ${response.status}`
      }
    }
    throw new Error(message)
  }

  return data
}

function withAuthHeaders(extraHeaders = {}) {
  const token = localStorage.getItem('royalHotelToken')
  const headers = { ...extraHeaders }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  } else {
    console.warn('No authentication token found. API call may fail if authentication is required.')
  }

  return headers
}

export async function createRoomReservation(payload) {
  const res = await fetch(`${API_BASE_URL}/api/room-reservations`, {
    method: 'POST',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })

  return handleResponse(res)
}

export async function createDiningReservation(payload) {
  const res = await fetch(`${API_BASE_URL}/api/dining-reservations`, {
    method: 'POST',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })

  return handleResponse(res)
}

export async function getAvailableDiningTables(date, time, guests) {
  const query = new URLSearchParams({ date, time, guests })
  const res = await fetch(`${API_BASE_URL}/api/dining-reservations/available-tables?${query.toString()}`, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function createEventPlan(payload) {
  const res = await fetch(`${API_BASE_URL}/api/event-plans`, {
    method: 'POST',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })

  return handleResponse(res)
}

export async function login(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    return handleResponse(res)
  } catch (error) {
    // Handle network errors
    if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Please ensure the backend is running on ' + API_BASE_URL)
    }
    throw error
  }
}

export async function register(payload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(res)
}

export async function verifyOtp(payload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(res)
}

export async function getCurrentUser() {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: withAuthHeaders(),
  })

  return handleResponse(res)
}

export async function getMyRoomReservations() {
  const res = await fetch(`${API_BASE_URL}/api/room-reservations/my-reservations`, {
    headers: withAuthHeaders(),
  })

  return handleResponse(res)
}

export async function getMyDiningReservations() {
  const res = await fetch(`${API_BASE_URL}/api/dining-reservations/my-reservations`, {
    headers: withAuthHeaders(),
  })

  return handleResponse(res)
}

export async function getMyEventPlans() {
  const res = await fetch(`${API_BASE_URL}/api/event-plans/my-events`, {
    headers: withAuthHeaders(),
  })

  return handleResponse(res)
}

export async function updateProfile(payload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })

  return handleResponse(res)
}

export async function changePassword(payload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
    method: 'POST',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })

  return handleResponse(res)
}

export async function submitContactInquiry(payload) {
  const res = await fetch(`${API_BASE_URL}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(res)
}

// Admin APIs
// Public endpoint for customer-facing pages
export async function getPublicRoomTypes() {
  const res = await fetch(`${API_BASE_URL}/api/public/room-types`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return handleResponse(res)
}

// Admin endpoint (requires authentication)
export async function getRoomTypes() {
  const res = await fetch(`${API_BASE_URL}/api/admin/room-types`, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function createRoomType(payload) {
  const res = await fetch(`${API_BASE_URL}/api/admin/room-types`, {
    method: 'POST',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

export async function updateRoomType(id, payload) {
  const res = await fetch(`${API_BASE_URL}/api/admin/room-types/${id}`, {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

export async function deleteRoomType(id) {
  const res = await fetch(`${API_BASE_URL}/api/admin/room-types/${id}`, {
    method: 'DELETE',
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function getDiningTypes() {
  const res = await fetch(`${API_BASE_URL}/api/admin/dining-types`, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function createDiningType(payload) {
  const res = await fetch(`${API_BASE_URL}/api/admin/dining-types`, {
    method: 'POST',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

export async function updateDiningType(id, payload) {
  const res = await fetch(`${API_BASE_URL}/api/admin/dining-types/${id}`, {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

export async function deleteDiningType(id) {
  const res = await fetch(`${API_BASE_URL}/api/admin/dining-types/${id}`, {
    method: 'DELETE',
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}


// Public endpoint for customer-facing pages
export async function getPublicDiningTypes() {
  const res = await fetch(`${API_BASE_URL}/api/public/dining-types`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return handleResponse(res)
}

export async function getPublicEventTypes() {
  const res = await fetch(`${API_BASE_URL}/api/public/event-types`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return handleResponse(res)
}

// Admin endpoint (requires authentication)
export async function getEventTypes() {
  const res = await fetch(`${API_BASE_URL}/api/admin/event-types`, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function createEventType(payload) {
  const res = await fetch(`${API_BASE_URL}/api/admin/event-types`, {
    method: 'POST',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

export async function updateEventType(id, payload) {
  const res = await fetch(`${API_BASE_URL}/api/admin/event-types/${id}`, {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

export async function deleteEventType(id) {
  const res = await fetch(`${API_BASE_URL}/api/admin/event-types/${id}`, {
    method: 'DELETE',
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function getStaff() {
  const res = await fetch(`${API_BASE_URL}/api/admin/staff`, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function createStaff(payload) {
  const res = await fetch(`${API_BASE_URL}/api/admin/staff`, {
    method: 'POST',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

export async function updateStaff(id, payload) {
  const res = await fetch(`${API_BASE_URL}/api/admin/staff/${id}`, {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

export async function deleteStaff(id) {
  const res = await fetch(`${API_BASE_URL}/api/admin/staff/${id}`, {
    method: 'DELETE',
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function getInventory(type) {
  const url = type ? `${API_BASE_URL}/api/admin/inventory?type=${type}` : `${API_BASE_URL}/api/admin/inventory`
  const res = await fetch(url, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function createInventory(payload) {
  const res = await fetch(`${API_BASE_URL}/api/admin/inventory`, {
    method: 'POST',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

export async function updateInventory(id, payload) {
  const res = await fetch(`${API_BASE_URL}/api/admin/inventory/${id}`, {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

export async function deleteInventory(id) {
  const res = await fetch(`${API_BASE_URL}/api/admin/inventory/${id}`, {
    method: 'DELETE',
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function getKitchenOrders(status) {
  const url = status ? `${API_BASE_URL}/api/admin/kitchen-orders?status=${status}` : `${API_BASE_URL}/api/admin/kitchen-orders`
  const res = await fetch(url, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function updateKitchenOrderStatus(id, orderStatus) {
  const res = await fetch(`${API_BASE_URL}/api/admin/kitchen-orders/${id}/status`, {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ order_status: orderStatus }),
  })
  return handleResponse(res)
}


export async function getReports() {
  const res = await fetch(`${API_BASE_URL}/api/admin/reports/summary`, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function getRevenueReport(params = {}) {
  const query = new URLSearchParams()
  if (params.date) query.append('date', params.date)
  if (params.month) query.append('monthFilter', params.month)

  const res = await fetch(`${API_BASE_URL}/api/admin/reports/revenue?${query.toString()}`, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function getUsers() {
  const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function updateUser(id, payload) {
  const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

// Kitchen Admin APIs
export async function getKitchenOrdersForAdmin(status) {
  const url = status ? `${API_BASE_URL}/api/kitchen-admin/orders?status=${status}` : `${API_BASE_URL}/api/kitchen-admin/orders`
  const res = await fetch(url, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function updateOrderStatus(id, orderStatus) {
  const res = await fetch(`${API_BASE_URL}/api/kitchen-admin/orders/${id}/status`, {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ order_status: orderStatus }),
  })
  return handleResponse(res)
}

export async function getKitchenInventory() {
  const res = await fetch(`${API_BASE_URL}/api/kitchen-admin/inventory`, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function updateKitchenInventory(id, payload) {
  const res = await fetch(`${API_BASE_URL}/api/kitchen-admin/inventory/${id}`, {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

export async function getLowStockItems() {
  const res = await fetch(`${API_BASE_URL}/api/kitchen-admin/inventory/low-stock`, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

// Staff APIs
export async function getStaffProfile() {
  const res = await fetch(`${API_BASE_URL}/api/staff/profile`, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function updateStaffProfile(payload) {
  const res = await fetch(`${API_BASE_URL}/api/staff/profile`, {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

// Staff Reservation Management
export async function getStaffRoomReservations() {
  const res = await fetch(`${API_BASE_URL}/api/staff/room-reservations`, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function updateStaffRoomReservationStatus(id, status, reason = '') {
  const res = await fetch(`${API_BASE_URL}/api/staff/room-reservations/${id}/status`, {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ status, reason }),
  })
  return handleResponse(res)
}

export async function getStaffDiningReservations() {
  const res = await fetch(`${API_BASE_URL}/api/staff/dining-reservations`, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function updateStaffDiningReservationStatus(id, status, reason = '') {
  const res = await fetch(`${API_BASE_URL}/api/staff/dining-reservations/${id}/status`, {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ status, reason }),
  })
  return handleResponse(res)
}

export async function getStaffEventPlans() {
  const res = await fetch(`${API_BASE_URL}/api/staff/event-plans`, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function updateStaffEventPlanStatus(id, status, reason = '') {
  const res = await fetch(`${API_BASE_URL}/api/staff/event-plans/${id}/status`, {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ status, reason }),
  })
  return handleResponse(res)
}

export async function testAuth() {
  const res = await fetch(`${API_BASE_URL}/api/test/auth-info`, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

// ========== ADMIN RESERVATION MANAGEMENT ==========

// Room Reservations
export async function getAllRoomReservations() {
  const res = await fetch(`${API_BASE_URL}/api/admin/room-reservations`, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function updateRoomReservationStatus(id, status, reason = '') {
  const res = await fetch(`${API_BASE_URL}/api/admin/room-reservations/${id}/status`, {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ status, reason }),
  })
  return handleResponse(res)
}

export async function updateRoomReservation(id, data) {
  const res = await fetch(`${API_BASE_URL}/api/admin/room-reservations/${id}`, {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

// Dining Reservations
export async function getAllDiningReservations() {
  const res = await fetch(`${API_BASE_URL}/api/admin/dining-reservations`, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function updateDiningReservationStatus(id, status, reason = '') {
  const res = await fetch(`${API_BASE_URL}/api/admin/dining-reservations/${id}/status`, {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ status, reason }),
  })
  return handleResponse(res)
}

export async function updateDiningReservation(id, data) {
  const res = await fetch(`${API_BASE_URL}/api/admin/dining-reservations/${id}`, {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

// Event Plans
export async function getAllEventPlans() {
  const res = await fetch(`${API_BASE_URL}/api/admin/event-plans`, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function updateEventPlanStatus(id, status, reason = '') {
  const res = await fetch(`${API_BASE_URL}/api/admin/event-plans/${id}/status`, {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ status, reason }),
  })
  return handleResponse(res)
}

export async function updateEventPlan(id, data) {
  const res = await fetch(`${API_BASE_URL}/api/admin/event-plans/${id}`, {
    method: 'PUT',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}


// ========== MENU MANAGEMENT API ==========
export async function getMenuItems() {
  const res = await fetch(`${API_BASE_URL}/api/menu-items`)
  return handleResponse(res)
}

export async function createMenuItem(payload) {
  const res = await fetch(`${API_BASE_URL}/api/menu-items`, {
    method: 'POST',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  })
  return handleResponse(res)
}

export async function updateMenuItem(id, payload) {
  const res = await fetch(`${API_BASE_URL}/api/menu-items/${id}`, {
    method: 'PUT',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  })
  return handleResponse(res)
}

// ==========================================
// Kitchen Admin API
// ==========================================

export async function getKitchenAdminOrders(status) {
  const url = status
    ? `${API_BASE_URL}/api/kitchen-admin/orders?status=${status}`
    : `${API_BASE_URL}/api/kitchen-admin/orders`
  const res = await fetch(url, {
    headers: withAuthHeaders(),
  })
  return handleResponse(res)
}

export async function updateKitchenAdminOrderStatus(id, status) {
  const res = await fetch(`${API_BASE_URL}/api/kitchen-admin/orders/${id}/status`, {
    method: 'PUT',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ order_status: status })
  })
  return handleResponse(res)
}

export async function getKitchenAdminInventory(type) {
  const url = type
    ? `${API_BASE_URL}/api/kitchen-admin/inventory?type=${type}`
    : `${API_BASE_URL}/api/kitchen-admin/inventory`
  const res = await fetch(url, { headers: withAuthHeaders() })
  return handleResponse(res)
}

export async function updateKitchenAdminInventory(id, payload) {
  const res = await fetch(`${API_BASE_URL}/api/kitchen-admin/inventory/${id}`, {
    method: 'PUT',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  })
  return handleResponse(res)
}

// ==========================================
// Contact Inquiries API
// ==========================================

export async function getContactInquiries(status) {
  const url = status
    ? `${API_BASE_URL}/api/admin/contact-inquiries?status=${status}`
    : `${API_BASE_URL}/api/admin/contact-inquiries`
  const res = await fetch(url, { headers: withAuthHeaders() })
  return handleResponse(res)
}

export async function updateInquiryStatus(id, status) {
  const res = await fetch(`${API_BASE_URL}/api/admin/contact-inquiries/${id}/status`, {
    method: 'PUT',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status })
  })
  return handleResponse(res)
}

export async function replyToInquiry(id, message) {
  const res = await fetch(`${API_BASE_URL}/api/admin/contact-inquiries/${id}/reply`, {
    method: 'POST',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ message })
  })
  return handleResponse(res)
}

export async function deleteMenuItem(id) {
  const res = await fetch(`${API_BASE_URL}/api/menu-items/${id}`, {
    method: 'DELETE',
    headers: withAuthHeaders({})
  })
  return handleResponse(res)
}

export { API_BASE_URL }
