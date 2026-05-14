import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { supabaseAdmin } from '@/shared/lib/supabase/admin'
import { requireAdmin } from '@/app/api/admin/_auth'

const bucketName = 'product-images'

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[а]/g, 'a')
    .replace(/[б]/g, 'b')
    .replace(/[в]/g, 'v')
    .replace(/[г]/g, 'g')
    .replace(/[д]/g, 'd')
    .replace(/[её]/g, 'e')
    .replace(/[ж]/g, 'zh')
    .replace(/[з]/g, 'z')
    .replace(/[и]/g, 'i')
    .replace(/[й]/g, 'y')
    .replace(/[к]/g, 'k')
    .replace(/[л]/g, 'l')
    .replace(/[м]/g, 'm')
    .replace(/[н]/g, 'n')
    .replace(/[о]/g, 'o')
    .replace(/[п]/g, 'p')
    .replace(/[р]/g, 'r')
    .replace(/[с]/g, 's')
    .replace(/[т]/g, 't')
    .replace(/[у]/g, 'u')
    .replace(/[ф]/g, 'f')
    .replace(/[х]/g, 'h')
    .replace(/[ц]/g, 'c')
    .replace(/[ч]/g, 'ch')
    .replace(/[ш]/g, 'sh')
    .replace(/[щ]/g, 'sch')
    .replace(/[ъь]/g, '')
    .replace(/[ы]/g, 'y')
    .replace(/[э]/g, 'e')
    .replace(/[ю]/g, 'yu')
    .replace(/[я]/g, 'ya')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return auth.response
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const productId = String(formData.get('productId') || '')
    const productName = String(formData.get('productName') || 'product')

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Файл не передан' }, { status: 400 })
    }

    if (!allowedTypes.has(file.type)) {
      return NextResponse.json(
        { message: 'Можно загружать только JPG, PNG, WEBP или AVIF' },
        { status: 400 },
      )
    }

    const maxSize = 10 * 1024 * 1024

    if (file.size > maxSize) {
      return NextResponse.json(
        { message: 'Файл слишком большой. Максимум 10 МБ' },
        { status: 400 },
      )
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer())

    const outputBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({
        width: 1400,
        height: 1400,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: 82,
        effort: 5,
      })
      .toBuffer()

    const safeName = slugify(productName) || 'product'
    const fileName = `${Date.now()}-${safeName}.webp`
    const filePath = productId ? `products/${productId}/${fileName}` : `products/${fileName}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, outputBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: false,
      })

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabaseAdmin.storage.from(bucketName).getPublicUrl(filePath)

    return NextResponse.json({
      path: filePath,
      url: data.publicUrl,
      size: outputBuffer.length,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { message: 'Не удалось загрузить изображение' },
      { status: 500 },
    )
  }
}