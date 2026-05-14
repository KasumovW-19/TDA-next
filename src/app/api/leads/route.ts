import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/shared/lib/supabase/admin'
import { sendTelegramLead } from '@/shared/lib/notifications/sendTelegramLead'

type LeadItemPayload = {
  productId: string
  quantity: number
}

type CreateLeadPayload = {
  customerName: string
  phone: string
  email?: string
  contactPreference?: string
  message?: string
  source?: string
  items: LeadItemPayload[]
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateLeadPayload

    const customerName = body.customerName?.trim()
    const phone = body.phone?.trim()
    const items = Array.isArray(body.items) ? body.items : []

    if (!customerName || !phone) {
      return NextResponse.json(
        { message: 'Укажите имя и телефон' },
        { status: 400 },
      )
    }

    if (items.length === 0) {
      return NextResponse.json(
        { message: 'Добавьте товары в заявку' },
        { status: 400 },
      )
    }

    const productIds = Array.from(new Set(items.map((item) => item.productId)))

    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, price, is_active')
      .in('id', productIds)

    if (productsError) {
      throw productsError
    }

    const activeProducts = (products ?? []).filter((product) => product.is_active)

    if (activeProducts.length === 0) {
      return NextResponse.json(
        { message: 'Товары не найдены' },
        { status: 400 },
      )
    }

    const productById = new Map(activeProducts.map((product) => [product.id, product]))

    const leadItems = items
      .map((item) => {
        const product = productById.get(item.productId)

        if (!product) return null

        const quantity = Math.max(1, Number(item.quantity) || 1)
        const price = Number(product.price ?? 0)

        return {
          product_id: product.id,
          product_name: product.name,
          price,
          quantity,
        }
      })
      .filter(Boolean) as {
      product_id: string
      product_name: string
      price: number
      quantity: number
    }[]

    if (leadItems.length === 0) {
      return NextResponse.json(
        { message: 'В заявке нет доступных товаров' },
        { status: 400 },
      )
    }

    const totalAmount = leadItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    )

    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .insert({
        customer_name: customerName,
        phone,
        email: body.email?.trim() || null,
        contact_preference: body.contactPreference || 'any',
        message: body.message?.trim() || null,
        source: body.source || 'cart',
        status: 'new',
        total_amount: totalAmount,
      })
      .select('id')
      .single()

    if (leadError) {
      throw leadError
    }

    const { error: leadItemsError } = await supabaseAdmin.from('lead_items').insert(
      leadItems.map((item) => ({
        lead_id: lead.id,
        ...item,
      })),
    )

    if (leadItemsError) {
      throw leadItemsError
    }

    const notificationItems = leadItems.map((item) => ({
      productName: item.product_name,
      price: item.price,
      quantity: item.quantity,
    }))

    const telegramResult = await Promise.allSettled([
      sendTelegramLead({
        leadId: lead.id,
        customerName,
        phone,
        email: body.email?.trim() || null,
        message: body.message?.trim() || null,
        totalAmount,
        items: notificationItems,
      }),
    ])

    if (telegramResult[0]?.status === 'rejected') {
      console.error('Telegram notification error:', telegramResult[0].reason)
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { message: 'Не удалось отправить заявку' },
      { status: 500 },
    )
  }
}