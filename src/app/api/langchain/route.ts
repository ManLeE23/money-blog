import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatDeepSeek } from '@langchain/deepseek';
import { SystemPropmpt } from '@/agent/prompt';
import { NextRequest, NextResponse } from 'next/server';

const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
  apiKey: 'sk-2b80a6cc6e2944a9a761a3d898c826d1',
});

const prompt = ChatPromptTemplate.fromMessages([
  ['system', SystemPropmpt],
  ['user', '{input}'],
]);

// // 链式调用（Prompt + LLM）
const chain = prompt.pipe(llm);

export async function POST(request: NextRequest) {
  const { query } = await request.json();
  if (!query)
    return NextResponse.json({ error: '查询不能为空' }, { status: 400 });

  // 执行链式调用
  // const result = await llm.invoke([
  //   ['system', SystemPropmpt],
  //   ['human', query],
  // ]);

  const result = await chain.invoke({ input: query });

  return NextResponse.json({ answer: result });
}
