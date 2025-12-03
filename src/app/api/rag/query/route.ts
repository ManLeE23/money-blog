// src/app/api/rag/query/route.ts
import dotenv from 'dotenv';
import path from 'path';
import { Pinecone } from '@pinecone-database/pinecone';
import { AlibabaTongyiEmbeddings } from '@langchain/community/embeddings/alibaba_tongyi';
import { ChatDeepSeek } from '@langchain/deepseek';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { SystemPropmpt } from '@/agent/prompt';
// 导入 Prisma 客户端
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid'; // 导入 UUID 生成函数

// 初始化 Prisma 客户端
const prisma = new PrismaClient();

// 手动加载.env.local（API路由是独立的，需手动加载）
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// 初始化客户端
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);
const embeddings = new AlibabaTongyiEmbeddings({
  apiKey: process.env.DASHSCOPE_API_KEY!,
  modelName: 'text-embedding-v2',
});
const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
  apiKey: process.env.DEEPSEEK_API_KEY!,
  streaming: true,
});

const llmPrompt = ChatPromptTemplate.fromMessages([
  ['system', SystemPropmpt],
  [
    'user',
    `
    历史对话上下文：
    {history}

    参考资料：
    {context}

    当前用户问题：{query}
  `,
  ],
]);

// // 链式调用（Prompt + LLM）
const llmChain = llmPrompt.pipe(llm);

export async function POST(request: Request) {
  try {
    const { query, conversationId } = await request.json();

    if (!query)
      return new Response(JSON.stringify({ error: '查询不能为空' }), {
        status: 400,
      });

    // 1. 处理对话ID：无则创建新对话，有则复用
    let conversation;
    if (conversationId) {
      // 验证对话是否存在
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: true }, // 关联查询历史消息
      });
      if (!conversation) {
        return new Response(JSON.stringify({ error: '对话不存在' }), {
          status: 404,
        });
      }
    } else {
      // 创建新对话
      // 🌟 显式生成 UUID 作为新对话ID，不依赖 Prisma 默认值
      const newConversationId = uuidv4();
      // 创建新对话（传入显式生成的ID）
      conversation = await prisma.conversation.create({
        data: {
          id: newConversationId, // 手动指定ID，确保存在
          // messages: { create: [] },
        },
        include: { messages: true }, // 关联查询消息（初始为空）
      });
      console.log('✅ 首次对话：创建新对话，ID=', newConversationId);
    }

    // 2. 拼接历史对话上下文（只取最近10条，避免Token超标）
    const historyMessages = conversation.messages
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()) // 按时间升序
      .slice(-10); // 保留最近10条（可调整）
    const history = historyMessages
      .map((msg) => `${msg.role === 'user' ? '用户' : '助手'}：${msg.content}`)
      .join('\n');

    // 3. 把用户查询转成向量
    const queryVector = await embeddings.embedQuery(query);

    // 4. 从Pinecone检索最相似的3个文本块
    const searchRes = await pineconeIndex.query({
      vector: queryVector,
      topK: 3,
      includeMetadata: true,
    });

    const context = searchRes.matches
      .map(
        (match) =>
          `来源：《${match.metadata?.title}》\n相似度：${match.score}\n内容：${match.metadata?.content}\n文章链接：/posts/${match.metadata?.slug}`
      )
      .join('\n\n');

    let fullAiAnswer = '';
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const streamIterator = await llmChain.stream({
            query,
            context,
            history,
          });

          for await (const chunk of streamIterator) {
            const content = chunk.content || '';
            if (content) {
              fullAiAnswer += content;
              // 🌟 优化：JSON.stringify 确保无特殊字符，结尾严格 \n\n
              const data = JSON.stringify({
                type: 'stream',
                content: content,
                conversationId: conversation.id,
                sources: searchRes.matches.map((match) => ({
                  id: match.id,
                  title: match.metadata?.title || '未知来源',
                  link: `/posts/${match.metadata?.slug || ''}`,
                  scoreText: `${Math.round((match.score || 0) * 100)}%`,
                })),
              });
              // 严格遵循 SSE 格式：data: + JSON + 两个换行
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          // 流结束标识（同样规范格式）
          const completeData = JSON.stringify({
            type: 'complete',
            message: '回答完成',
          });
          controller.enqueue(encoder.encode(`data: ${completeData}\n\n`));

          // 存储用户消息和完整AI回答到数据库（流结束后统一存储）
          await Promise.all([
            prisma.message.create({
              data: {
                content: query,
                role: 'user',
                conversationId: conversation.id,
              },
            }),
            prisma.message.create({
              data: {
                content: fullAiAnswer,
                role: 'assistant',
                conversationId: conversation.id,
              },
            }),
          ]);

          // 错误推送（规范格式）
        } catch (err) {
          const errorData = JSON.stringify({
            type: 'error',
            error: (err as Error).message,
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    // 5. 返回流式响应（设置 SSE 响应头）
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream', // SSE 标准响应头
        'Cache-Control': 'no-cache', // 禁用缓存，确保实时推送
        Connection: 'keep-alive', // 保持长连接
      },
    });
  } catch (err) {
    console.error('SSE 流式请求失败：', (err as Error).message);
    return new Response(JSON.stringify({ error: '请求处理失败' }), {
      status: 500,
    });
  }
}
