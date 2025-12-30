export interface Company {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip_code: string
  phone_number: string
  accepts_walk_ins: boolean
  appointment_required: boolean
  latitude?: number
  longitude?: number
  created_at?: string
  updated_at?: string
}

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

export interface Order {
  id: string
  customer_email: string
  customer_name: string
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
  test_type_id: string
  price: number
  created_at?: string
}

export interface CartItem {
  company: Company
  test: TestType & { price: number }
  quantity: number
}
