import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    if (!conversationId) {
      return NextResponse.json({ error: '缺少对话ID' }, { status: 400 });
    }

    // 查询对话的所有消息（按时间升序）
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, content: true, role: true, createdAt: true },
    });

    return NextResponse.json({ messages }, { status: 200 });
  } catch (err) {
    console.error('加载历史消息失败：', (err as Error).message);
    return NextResponse.json({ error: '加载失败' }, { status: 500 });
  }
}
