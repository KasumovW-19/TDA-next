import { Resend } from 'resend'

type LeadNotificationItem = {
  productName: string
  price: number
  quantity: number
}

type SendEmailLeadParams = {
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

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

export const sendEmailLead = async ({
  leadId,
  customerName,
  phone,
  email,
  message,
  totalAmount,
  items,
}: SendEmailLeadParams) => {
  const apiKey = process.env.RESEND_API_KEY
  const managerEmail = process.env.MANAGER_EMAIL

  if (!apiKey || !managerEmail) {
    return
  }

  const resend = new Resend(apiKey)

  const itemsHtml = items
    .map(
      (item, index) =>
        `<li>${index + 1}. ${escapeHtml(item.productName)} — ${item.quantity} шт. × ${formatRub(
          item.price,
        )}</li>`,
    )
    .join('')

  const html = `
    <div style="font-family: Arial, sans-serif; color: #171717; line-height: 1.5;">
      <h2 style="margin: 0 0 16px;">Новая заявка с сайта TDA</h2>

      <p><strong>ID заявки:</strong> ${escapeHtml(leadId)}</p>
      <p><strong>Имя:</strong> ${escapeHtml(customerName)}</p>
      <p><strong>Телефон:</strong> ${escapeHtml(phone)}</p>
      ${email ? `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` : ''}

      <h3 style="margin: 24px 0 8px;">Товары</h3>
      <ul>${itemsHtml}</ul>

      <p><strong>Сумма по каталогу:</strong> ${formatRub(totalAmount)}</p>

      ${
        message
          ? `<h3 style="margin: 24px 0 8px;">Комментарий</h3><p>${escapeHtml(message).replaceAll(
              '\n',
              '<br>',
            )}</p>`
          : ''
      }
    </div>
  `

  const { error } = await resend.emails.send({
    from: 'ТДА Заявки <requests@send.tda-cst.ru>',
    to: [managerEmail],
    subject: `Новая заявка с сайта TDA — ${customerName}`,
    html,
  })

  if (error) {
    throw new Error(`Email notification failed: ${JSON.stringify(error)}`)
  }
}