// src/app/api/rag/query-with-persist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ragQueryWithMemory } from '@/lib/langchain/rag-with-memory';
import {
  saveConversationToDB,
  getConversationFromDB,
} from '@/lib/langchain/persistent-memory';

export async function POST(request: NextRequest) {
  try {
    const { query, userId } = await request.json();
    if (!query || !userId) {
      return NextResponse.json(
        { error: '查询和用户标识不能为空' },
        { status: 400 }
      );
    }

    // 1. 从数据库获取用户历史对话
    const historyMessages = await getConversationFromDB(userId);

    // 2. 调用带上下文的 RAG 查询
    const answer = await ragQueryWithMemory(query, historyMessages);

    // 3. 保存更新后的对话到数据库
    const newMessages = [
      ...historyMessages,
      { id: Date.now().toString(), content: query, isUser: true },
      { id: (Date.now() + 1).toString(), content: answer, isUser: false },
    ];
    await saveConversationToDB(userId, newMessages);

    return NextResponse.json({ answer, newMessages });
  } catch (error) {
    console.error('持久化上下文查询错误：', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
