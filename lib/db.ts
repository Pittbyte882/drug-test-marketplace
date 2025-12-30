// Placeholder database functions
// These will be replaced with actual Supabase queries once connected
import { supabase } from './supabase'

// ============================================
// COMPANIES
// ============================================
export async function getCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  if (error) throw error
  return data
}

export async function getCompanyById(id: string) {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

// ============================================
// LOCATIONS
// ============================================
export async function searchLocations(city?: string, state?: string, zipCode?: string) {
  let query = supabase
    .from('locations')
    .select(`
      *,
      companies (
        id,
        name,
        logo_url
      )
    `)
    .eq('is_active', true)
  
  if (city) query = query.ilike('city', `%${city}%`)
  if (state) query = query.eq('state', state)
  if (zipCode) query = query.eq('zip_code', zipCode)
  
  const { data, error } = await query.order('city')
  
  if (error) throw error
  return data
}

export async function getLocationsByCompany(companyId: string) {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
  
  if (error) throw error
  return data
}

// ============================================
// TESTS
// ============================================
export async function getTestsByCompany(companyId: string) {
  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('name')
  
  if (error) throw error
  return data
}

export async function getTestById(id: string) {
  const { data, error } = await supabase
    .from('tests')
    .select(`
      *,
      companies (
        id,
        name,
        logo_url
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

// ============================================
// ORDERS
// ============================================
export async function createOrder(orderData: {
  customer_name: string
  customer_email: string
  customer_phone?: string
  total_amount: number
  payment_status: string
  stripe_payment_intent_id?: string
  items: Array<{
    test_id: string
    location_id: string
    company_id: string
    quantity: number
    price: number
  }>
}) {
  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  
  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      total_amount: orderData.total_amount,
      payment_status: orderData.payment_status,
      stripe_payment_intent_id: orderData.stripe_payment_intent_id,
    })
    .select()
    .single()
  
  if (orderError) throw orderError
  
  // Create order items
  const orderItems = orderData.items.map(item => ({
    order_id: order.id,
    test_id: item.test_id,
    location_id: item.location_id,
    company_id: item.company_id,
    quantity: item.quantity,
    price: item.price,
  }))
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
  
  if (itemsError) throw itemsError
  
  return order
}

export async function getOrderById(id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        tests (*),
        locations (*),
        companies (*)
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getOrderByNumber(orderNumber: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        tests (*),
        locations (*),
        companies (*)
      )
    `)
    .eq('order_number', orderNumber)
    .single()
  
  if (error) throw error
  return data
}