// scripts/ingest-posts.ts
import dotenv from 'dotenv';
import fs from 'fs-extra';
import path from 'path';
import { marked } from 'marked';
import { Pinecone } from '@pinecone-database/pinecone';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { AlibabaTongyiEmbeddings } from '@langchain/community/embeddings/alibaba_tongyi';

// 加载项目根目录的 .env.local 文件（因为脚本在 scripts 文件夹，需指定路径）
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const embeddings = new AlibabaTongyiEmbeddings({
  apiKey: process.env.DASHSCOPE_API_KEY!, // 从环境变量读取
  modelName: 'text-embedding-v2', // 对应通义千问的1536维模型
});

// 1. 初始化客户端（从环境变量读取配置，安全不暴露密钥）
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

// 2. 配置关键参数（不用改，按这个来）
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts'); // 文章文件夹路径
const CHUNK_SIZE = 500; // 文本块大小（500字/块，避免太长/太短）
const CHUNK_OVERLAP = 50; // 块之间重叠50字，保持上下文连贯

// 3. 读取 content/posts 里的所有 MD 文章
async function readAllPosts() {
  try {
    // 检查文章文件夹是否存在
    if (!(await fs.pathExists(POSTS_DIR))) {
      throw new Error(`文章文件夹不存在：${POSTS_DIR}`);
    }

    // 读取文件夹里的所有 MD 文件
    const files = await fs.readdir(POSTS_DIR);
    const mdFiles = files.filter((file) => file.endsWith('.mdx'));

    if (mdFiles.length === 0) {
      throw new Error(`content/posts 里没有找到 MD 文章`);
    }

    console.log(`找到 ${mdFiles.length} 篇文章，开始处理...`);

    // 遍历每篇文章，解析内容
    const posts = [];
    for (const file of mdFiles) {
      const filePath = path.join(POSTS_DIR, file);
      const fileContent = await fs.readFile(filePath, 'utf-8');

      // 解析 MD 为纯文本（去掉 Markdown 格式）
      const plainText = (await marked.parse(fileContent)).replace(
        /<[^>]*>/g,
        ''
      ); // 去掉解析后可能残留的 HTML 标签

      // 提取文章标题（假设文件名是 slug，比如 "nextjs-rag.md" → 标题 "Next.js RAG"）
      const title = file
        .replace('.mdx', '')
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      const slug = file.replace('.mdx', ''); // 文章唯一标识（和你博客的 slug 一致）

      posts.push({ title, slug, content: plainText, filePath });
    }

    return posts;
  } catch (error) {
    console.error('读取文章失败：', (error as Error).message);
    process.exit(1); // 报错退出脚本
  }
}

// 4. 分割文本块（RAG 核心步骤，长文本切分成小块）
async function splitTextIntoChunks(content: string) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
    separators: ['\n\n', '\n', '. ', ' ', ''], // 分割符优先级（优先按段落分割）
  });

  // 生成文本块
  const chunks = await splitter.createDocuments([content]);
  return chunks.map((chunk) => chunk.pageContent);
}

// 5. 生成向量 + 存入 Pinecone
async function upsertToPinecone(post: {
  title: string;
  slug: string;
  content: string;
}) {
  try {
    const chunks = await splitTextIntoChunks(post.content);
    console.log(`文章《${post.title}》分割为 ${chunks.length} 个文本块`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkId = `${post.slug}-chunk-${i}`;

      // 🌟 用 LangChain 的 DashScopeEmbeddings 生成向量（一行代码）
      const vector = await embeddings.embedQuery(chunk);

      // 存入 Pinecone 的逻辑不变
      await pineconeIndex.upsert([
        {
          id: chunkId,
          values: vector,
          metadata: {
            title: post.title,
            slug: post.slug,
            chunkIndex: i,
            content: chunk,
            source: `博客文章《${post.title}》`,
          },
        },
      ]);

      if ((i + 1) % 10 === 0) {
        console.log(`→ 已存入 ${i + 1}/${chunks.length} 个文本块`);
      }
    }

    console.log(`✅ 文章《${post.title}》成功导入 Pinecone\n`);
  } catch (error) {
    console.error(
      `❌ 文章《${post.title}》导入失败：`,
      (error as Error).message
    );
  }
}

// 6. 主函数（串联所有步骤）
async function main() {
  try {
    // 检查环境变量是否齐全
    const requiredEnv = [
      'DASHSCOPE_API_KEY',
      'PINECONE_API_KEY',
      'PINECONE_ENVIRONMENT',
      'PINECONE_INDEX_NAME',
    ];
    const missingEnv = requiredEnv.filter((key) => !process.env[key]);
    if (missingEnv.length > 0) {
      throw new Error(
        `缺少环境变量：${missingEnv.join(', ')}（请检查 .env.local 文件）`
      );
    }

    // 1. 读取所有文章
    const posts = await readAllPosts();

    // 2. 逐个导入 Pinecone
    for (const post of posts) {
      await upsertToPinecone(post);
    }

    console.log('🎉 所有文章都已成功导入向量数据库！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 导入失败：', (error as Error).message);
    process.exit(1);
  }
}

// 运行主函数
main();
