import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()

export async function signUp(data: {
  email: string
  password: string
  accountType: 'individual' | 'company'
  fullName: string
  companyName?: string
  contactPerson?: string
  phone: string
}) {
  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('No user returned')

    // 2. Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        account_type: data.accountType,
        full_name: data.fullName,
        company_name: data.companyName || null,
        contact_person: data.contactPerson || null,
        phone: data.phone,
      })

    if (profileError) throw profileError

    return { success: true, user: authData.user }
  } catch (error: any) {
    console.error('Sign up error:', error)
    return { success: false, error: error.message }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return { success: true, user: data.user }
  } catch (error: any) {
    console.error('Sign in error:', error)
    return { success: false, error: error.message }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('Sign out error:', error)
    return { success: false, error: error.message }
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Get profile error:', error)
    return null
  }
}