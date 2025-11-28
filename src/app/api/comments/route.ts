import { NextRequest, NextResponse } from 'next/server';

// 简单的内存存储（生产环境应使用数据库）
let comments: Array<{
  id: string;
  name: string;
  email: string;
  content: string;
  createdAt: string;
  postId: string;
}> = [
  // 示例评论数据
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    content: '这是一篇很棒的文章！学到了很多新知识。',
    createdAt: new Date('2024-01-15T10:30:00').toISOString(),
    postId: 'claude-code-course',
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    content: '感谢分享，内容非常有用，期待更多这样的文章。',
    createdAt: new Date('2024-01-14T15:45:00').toISOString(),
    postId: 'claude-code-course',
  },
];

// GET 获取评论列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: '缺少文章 ID' }, { status: 400 });
    }

    // 获取该文章的评论，按创建时间倒序排列
    const postComments = comments
      .filter((comment) => comment.postId === postId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .map(({ email, ...comment }) => comment); // 不返回邮箱信息

    return NextResponse.json(postComments);
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json({ error: '获取评论失败' }, { status: 500 });
  }
}

// POST 创建新评论
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, content, postId } = body;

    // 验证必填字段
    if (!name || !email || !content || !postId) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 });
    }

    // 验证内容长度
    if (content.trim().length < 1) {
      return NextResponse.json({ error: '评论内容不能为空' }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: '评论内容不能超过 1000 字符' },
        { status: 400 }
      );
    }

    // 创建新评论
    const newComment = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      content: content.trim(),
      postId: postId.trim(),
      createdAt: new Date().toISOString(),
    };

    // 添加到评论列表
    comments.unshift(newComment);

    // 返回不包含邮箱的评论信息
    const { email: _, ...commentResponse } = newComment;
    return NextResponse.json(commentResponse, { status: 201 });
  } catch (error) {
    console.error('创建评论失败:', error);
    return NextResponse.json({ error: '创建评论失败' }, { status: 500 });
  }
}
