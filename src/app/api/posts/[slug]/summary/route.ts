import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ChatDeepSeek } from '@langchain/deepseek';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const prisma = new PrismaClient();

// Configure LLM for summary generation
const llm = new ChatDeepSeek({
  model: 'deepseek-chat',
  apiKey: process.env.DEEPSEEK_API_KEY!,
});

// Summary generation prompt
const summaryPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    '你是一个专业的AI文章总结助手。请根据提供的文章内容，生成一个简洁、准确的摘要，突出文章的核心要点和关键信息。摘要应该用中文撰写，长度控制在100-200字之间。',
  ],
  ['user', '请为以下文章生成摘要：\n\n{content}'],
]);

const summaryChain = summaryPrompt.pipe(llm);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Check if summary already exists in database
    const existingSummary = await prisma.postSummary.findUnique({
      where: { slug },
    });

    if (existingSummary) {
      return NextResponse.json({
        summary: existingSummary.content,
        cached: true,
      });
    }

    // Get post content
    const postsModule = await import('@/lib/posts');
    const post = await postsModule.getPostBySlug(slug);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Generate AI summary
    const summaryResult = await summaryChain.invoke({
      content: post.content,
    });

    const summaryContent = summaryResult.content as string;

    // Save summary to database
    const savedSummary = await prisma.postSummary.create({
      data: {
        slug,
        content: summaryContent,
      },
    });

    return NextResponse.json({
      summary: savedSummary.content,
      cached: false,
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
