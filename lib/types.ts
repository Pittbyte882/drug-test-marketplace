export interface Company {
  id: string
  name: string
  description?: string
  logo_url?: string
  phone?: string
  email?: string
  website?: string
  hours_of_operation?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Location {
  id: string
  company_id: string
  name: string
  address: string
  city: string
  state: string
  zip_code: string
  phone?: string
  latitude?: number
  longitude?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface TestCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  display_order: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Test {
  id: string
  company_id: string
  name: string
  description?: string
  price: number
  test_type: string
  category_id?: string
  turnaround_time?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface TestWithCategory extends Test {
  test_categories?: TestCategory
}

export interface Order {
  id: string
  order_number: string
  customer_email: string
  customer_name: string
  customer_phone?: string
  total_amount: number
  stripe_payment_intent_id?: string
  payment_status: "pending" | "completed" | "failed"
  created_at?: string
  updated_at?: string
}

export interface OrderItem {
  id: string
  order_id: string
  company_id: string
  test_id: string
  location_id: string
  price: number
  quantity: number
  created_at?: string
}

export interface CartItem {
  company: Company
  location: {
    id: string
    name: string
    address: string
    city: string
    state: string
    zip_code: string
    phone?: string
  }
  test: Test
  quantity: number
}

// Legacy interfaces for backward compatibility
export interface TestType {
  id: string
  name: string
  description?: string
  category: "drug_test" | "dna_test" | "background_check" | "occupational_health"
  created_at?: string
  updated_at?: string
}

export interface CompanyTest {
  id: string
  company_id: string
  test_type_id: string
  price: number
  available: boolean
  created_at?: string
  updated_at?: string
}

export interface CompanyWithTests extends Company {
  tests: Array<TestType & { price: number }>
}