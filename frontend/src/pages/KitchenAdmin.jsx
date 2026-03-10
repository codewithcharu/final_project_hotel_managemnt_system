import { useState, useEffect } from 'react'
import { getKitchenAdminOrders, updateKitchenAdminOrderStatus, getKitchenAdminInventory, updateKitchenAdminInventory } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function KitchenAdmin() {
  const [activeTab, setActiveTab] = useState('orders')

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', paddingTop: '6rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#111827', margin: 0 }}>Kitchen Dashboard</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setActiveTab('orders')}
              style={{
                padding: '0.75rem 1.5rem',
                background: activeTab === 'orders' ? '#d4af37' : '#fff',
                color: activeTab === 'orders' ? '#fff' : '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
              }}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              style={{
                padding: '0.75rem 1.5rem',
                background: activeTab === 'inventory' ? '#d4af37' : '#fff',
                color: activeTab === 'inventory' ? '#fff' : '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
              }}
            >
              Inventory
            </button>
          </div>
        </div>

        {activeTab === 'orders' ? <KitchenOrders /> : <KitchenInventory />}
      </div>
    </div>
  )
}

function KitchenOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Poll every 30s
  useEffect(() => {
    loadOrders()
    const interval = setInterval(loadOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadOrders = async () => {
    try {
      const res = await getKitchenAdminOrders()
      const data = Array.isArray(res) ? res : (res.data || [])
      setOrders(data)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateKitchenAdminOrderStatus(id, newStatus)
      loadOrders() // Refresh
    } catch (e) {
      alert("Failed to update status")
    }
  }

  if (loading) return <div>Loading orders...</div>

  const activeOrders = orders.filter(o => {
    const s = o.orderStatus?.toLowerCase();
    return s !== 'completed' && s !== 'cancelled';
  });
  const completedOrders = orders.filter(o => {
    const s = o.orderStatus?.toLowerCase();
    return s === 'completed' || s === 'cancelled';
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Active Orders Section */}
      <div>
        <h2 style={{ fontSize: '1.25rem', color: '#374151', marginBottom: '1rem' }}>Active Orders ({activeOrders.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {activeOrders.map(order => <OrderCard key={order.id} order={order} onUpdate={handleStatusUpdate} />)}
          {activeOrders.length === 0 && <p style={{ color: '#6b7280', fontStyle: 'italic', padding: '1rem', background: '#fff', borderRadius: '8px' }}>No active orders pending.</p>}
        </div>
      </div>

      {/* Completed Orders Section */}
      <div>
        <h2 style={{ fontSize: '1.25rem', color: '#374151', marginBottom: '1rem', marginTop: '2rem' }}>Recent History</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', opacity: 0.75 }}>
          {completedOrders.slice(0, 8).map(order => <OrderCard key={order.id} order={order} onUpdate={handleStatusUpdate} readOnly />)}
        </div>
      </div>
    </div>
  )
}

function OrderCard({ order, onUpdate, readOnly }) {
  const statusColors = {
    pending: '#ef4444',    // Red
    preparing: '#f59e0b',  // Orange
    completed: '#10b981',  // Green
    cancelled: '#6b7280'
  }
  const color = statusColors[order.orderStatus?.toLowerCase()] || '#6b7280'

  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderTop: `4px solid ${color}`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold', color: '#111827', fontSize: '1.1rem' }}>Order #{order.id}</span>
        <span style={{ fontSize: '0.85rem', color: '#6b7280', background: '#f3f4f6', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
          {order.reservationTime ? order.reservationTime.substring(0, 5) : 'N/A'}
        </span>
      </div>
      <div style={{ marginBottom: '1rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem' }}>
        <p style={{ margin: '0 0 0.25rem 0', fontWeight: 500, color: '#374151' }}>{order.guestName}</p>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
          {order.reservationDate} • {order.guestCount} Guests
        </p>
      </div>

      <div style={{ background: '#f9fafb', padding: '0.875rem', borderRadius: '8px', marginBottom: '1.25rem', flex: 1 }}>
        <p style={{ margin: 0, fontSize: '0.95rem', color: '#111827', whiteSpace: 'pre-wrap' }}>
          {order.specialRequests || 'No special requests'}
        </p>
      </div>

      {!readOnly && (
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
          {order.orderStatus?.toLowerCase() === 'pending' && (
            <button onClick={() => onUpdate(order.id, 'preparing')} style={{ flex: 1, padding: '0.75rem', background: '#fff', color: '#d97706', border: '1px solid #d97706', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>Move to Prep</button>
          )}
          {(order.orderStatus?.toLowerCase() === 'preparing' || order.orderStatus?.toLowerCase() === 'pending') && (
            <button onClick={() => onUpdate(order.id, 'completed')} style={{ flex: 1, padding: '0.75rem', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)' }}>Complete Order</button>
          )}
        </div>
      )}
      <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color, fontWeight: 700, letterSpacing: '0.05em' }}>
          {order.orderStatus}
        </span>
      </div>
    </div>
  )
}

function KitchenInventory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getKitchenAdminInventory().then(res => {
      setItems(Array.isArray(res) ? res : res.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleUpdateStock = async (id, newQty) => {
    try {
      await updateKitchenAdminInventory(id, { quantity: parseInt(newQty) })
      setItems(items.map(i => i.id === id ? { ...i, quantity: parseInt(newQty) } : i))
    } catch (e) {
      alert('Failed update')
    }
  }

  if (loading) return <div>Loading inventory...</div>

  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: '1.25rem', color: '#374151', marginBottom: '1.5rem' }}>Inventory Tracking</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
          <thead>
            <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
              <th style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', color: '#4b5563' }}>Ingredient / Item</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', color: '#4b5563' }}>Current Stock</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', color: '#4b5563' }}>Unit</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', color: '#4b5563' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No inventory items found.</td></tr>}
            {items.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: '#111827' }}>{item.name}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="number"
                      defaultValue={item.quantity}
                      onBlur={(e) => handleUpdateStock(item.id, e.target.value)}
                      style={{ width: '80px', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', textAlign: 'center' }}
                    />
                  </div>
                </td>
                <td style={{ padding: '1rem', color: '#6b7280' }}>{item.unit}</td>
                <td style={{ padding: '1rem' }}>
                  {item.quantity <= item.minStockLevel
                    ? <span style={{ color: '#ef4444', fontWeight: 600, background: '#fee2e2', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem' }}>Low Stock</span>
                    : <span style={{ color: '#10b981', fontWeight: 600, background: '#d1fae5', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem' }}>Healthy</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
