import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const productId = request.nextUrl.searchParams.get('product')
    const source = request.nextUrl.searchParams.get('source') || 'direct'

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        telegram_url: true,
        telegram_username: true,
        telegram_message: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const session = await getSession()
    const userId = session?.user?.id

    // Create lead record
    await prisma.lead.create({
      data: {
        product_id: productId,
        user_id: userId,
        source,
        action: 'clicked',
        telegram_clicked: true,
        session_id: request.cookies.get('session-id')?.value || null,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        referrer: request.headers.get('referer') || null,
      },
    })

    // Update product click count
    await prisma.product.update({
      where: { id: productId },
      data: {
        clicks_count: { increment: 1 },
      },
    })

    // Determine Telegram destination
    let telegramUrl = product.telegram_url || process.env.NEXT_PUBLIC_TELEGRAM_DM || "https://t.me/propfirmeapasser1";
    
    if (product.telegram_username && !product.telegram_url) {
      telegramUrl = `https://t.me/${product.telegram_username.replace('@', '')}`;
    }

    const telegramMessage = product.telegram_message || `Hi, I'm interested in ${product.name}.`;
    const encodedMessage = encodeURIComponent(telegramMessage);
    const fullUrl = `${telegramUrl}?text=${encodedMessage}`;

    return NextResponse.json({
      success: true,
      telegram_url: fullUrl,
    })
  } catch (error) {
    console.error('Failed to create lead:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}