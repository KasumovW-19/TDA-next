import { NextResponse } from 'next/server'
import { requireAdmin } from '../_auth'
import { supabaseAdmin } from '@/shared/lib/supabase/admin'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return auth.response
  }

  const { data, error } = await supabaseAdmin
    .from('leads')
    .select(
      `
      id,
      customer_name,
      phone,
      email,
      message,
      status,
      total_amount,
      source,
      created_at,
      lead_items (
        id,
        product_name,
        quantity,
        price
      )
    `,
    )
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error(error)
    return NextResponse.json({ message: 'Не удалось получить заявки' }, { status: 500 })
  }

  return NextResponse.json({ success: true, leads: data ?? [] })
}
