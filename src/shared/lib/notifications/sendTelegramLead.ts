type LeadNotificationItem = {
    productName: string
    price: number
    quantity: number
  }
  
  type SendTelegramLeadParams = {
    leadId: string
    customerName: string
    phone: string
    email?: string | null
    message?: string | null
    totalAmount: number
    items: LeadNotificationItem[]
  }
  
  const formatRub = (value: number) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(value)
  
  export const sendTelegramLead = async ({
    leadId,
    customerName,
    phone,
    email,
    message,
    totalAmount,
    items,
  }: SendTelegramLeadParams) => {
    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID
  
    if (!token || !chatId) {
      return
    }
  
    const productsText = items
      .map(
        (item, index) =>
          `${index + 1}. ${item.productName} — ${item.quantity} шт. × ${formatRub(item.price)}`,
      )
      .join('\n')
  
  const detailsText = message?.trim() || ''
  const contactLines = [`Имя: ${customerName}`, `Телефон: ${phone}`, email ? `Email: ${email}` : null]
    .filter(Boolean)
    .join('\n')
  const detailsBlock = detailsText ? `\n\n${detailsText}` : ''

  const text =
    `Новая заявка с сайта TDA\n` +
    `ID: ${leadId}\n\n` +
    `${contactLines}\n\n` +
    `Товары:\n` +
    `${productsText}\n` +
    `Сумма по каталогу: ${formatRub(totalAmount)}` +
    detailsBlock
  
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    })
  
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Telegram notification failed: ${errorText}`)
    }
  }