// src/components/chat/ChatPanel.tsx
'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AiOutlineClose, AiOutlineLeft } from 'react-icons/ai';
import { fetchRagQuery, fetchHistoryMessages } from '@/lib/request/config';
import {
  renderMarkdown,
  hasMarkdownSyntax,
  ParsedHtmlCache,
} from '@/lib/markdown'; // 导入你的现有方法
// import 'rehype-pretty-code/styles/themes/one-light.css'; // 对应你配置的 one-light 主题
import './ChatPanel.module.scss'; // 自定义样式（后续补充）

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  sources?: Array<{
    id: string;
    title: string;
    link: string;
    scoreText: string;
  }>;
  isStreaming?: boolean; // 是否正在流式加载
}

interface ChatPanelProps {
  onClose: () => void;
}

// 单条消息组件（缓存解析结果，避免重复渲染）
const ChatMessageItem = ({ msg }: { msg: ChatMessage }) => {
  const [parsedHtml, setParsedHtml] = useState<string>('');

  // 关键：仅在内容变化且含 Markdown 语法时，调用解析方法
  useMemo(async () => {
    const { content } = msg;
    if (hasMarkdownSyntax(content)) {
      // 调用你的现有方法解析 Markdown 为 HTML
      const html = await renderMarkdown(content);
      setParsedHtml(html);
    } else {
      setParsedHtml(''); // 无需解析，清空缓存
    }
  }, [msg.content]); // 仅依赖内容变化触发解析

  // 渲染逻辑：含 Markdown → 渲染解析后的 HTML；否则 → 纯文本（处理换行）
  return (
    <div
      className={`max-w-[90%] rounded-lg p-3 prose prose-sm ${
        msg.isUser
          ? 'bg-slate-100 text-slate-800'
          : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* {hasMarkdownSyntax(msg.content) ? (
        // 渲染解析后的 HTML（dangerouslySetInnerHTML 必须配合安全校验）
        <div
          dangerouslySetInnerHTML={{ __html: parsedHtml }}
          className="markdown-rendered"
        />
      ) : (
        // 纯文本渲染（whitespace-pre-line 处理换行）
        <div className="whitespace-pre-line">{msg.content}</div>
      )} */}
      <div className="whitespace-pre-line">{msg.content}</div>
    </div>
  );
};

// 用 React.memo 缓存组件，避免不必要的重渲染
const MemoizedChatMessageItem = React.memo(ChatMessageItem);

const ThinkingDiv = () => {
  return (
    <span className="bg-clip-text bg-gradient-to-r from-[#3b91ff] to-[#7E22CE] text-sm text-transparent">
      思考中...
    </span>
  );
};

export function ChatPanel({ onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hi，我是 Money，专注于 AI 应用工程与用户体验的融合。',
      isUser: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  // 存储对话ID（初始为空，第一次请求后从API获取）
  const [conversationId, setConversationId] = useState('');

  // 检测是否为移动端
  const [isMobile, setIsMobile] = useState(false);
  // 手动管理输入法状态：标记是否处于候选输入中
  const [isComposing, setIsComposing] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 初始化：若本地有 conversationId，加载历史对话（可选，优化体验）
  useEffect(() => {
    const savedConversationId = localStorage.getItem('conversationId');
    if (savedConversationId) {
      setConversationId(savedConversationId);
      // 可选：调用API加载历史消息（需额外写一个加载历史的接口）
      loadHistoryMessages(savedConversationId);
    }

    // 检测移动端
    const checkIsMobile = () => {
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    // 初始检测
    checkIsMobile();

    // 监听窗口大小变化
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // 核心滚动逻辑：消息列表变化时自动滚动到底部
  const scrollToBottom = () => {
    // 使用 requestAnimationFrame 确保 DOM 更新完成后再滚动
    requestAnimationFrame(() => {
      if (chatContainerRef.current) {
        const container = chatContainerRef.current;
        // 滚动到底部（scrollHeight 是内容总高度，scrollTop 是滚动距离）
        container.scrollTop = container.scrollHeight;
      }
    });
  };

  // 监听 messages 变化，触发滚动（包括新消息、历史消息加载）
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsgId = Date.now().toString();
    const aiMsgId = (Date.now() + 1).toString();

    // 添加用户消息
    const userMessage: ChatMessage = {
      id: userMsgId,
      content: input,
      isUser: true,
    };
    setMessages((prev) => [...prev, userMessage]);

    const loadingAiMessage: ChatMessage = {
      id: aiMsgId,
      content: '', // 初始为空，后续逐字拼接
      isUser: false,
      isStreaming: true,
      sources: [],
    };
    setMessages((prev) => [...prev, loadingAiMessage]);

    setInput('');
    onChatSSE(input, aiMsgId);
  };

  const onChatSSE = async (query: string, aiMsgId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input, conversationId: conversationId }),
      });

      if (!response.ok) throw new Error(`请求失败，状态码：${response.status}`);
      if (!response.body) throw new Error('服务器未返回流式响应');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullAiContent = '';
      let aiSources: ChatMessage['sources'] = [];
      let buffer = ''; // 🌟 关键：累积字节流的缓冲区

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 🌟 步骤1：将新读取的字节解码后追加到缓冲区
        buffer += decoder.decode(value, { stream: true }); // stream: true 确保分块解码不丢失

        // 🌟 步骤2：按 SSE 分隔符 \n\n 分割缓冲区，处理所有完整的 SSE 块
        while (buffer.includes('\n\n')) {
          // 提取第一个完整的 SSE 块（从开头到第一个 \n\n）
          const sseBlockEndIndex = buffer.indexOf('\n\n');
          const sseBlock = buffer.slice(0, sseBlockEndIndex).trim(); // 去除前后空白（避免空行）
          // 更新缓冲区：保留未处理的部分（第一个 \n\n 之后的内容）
          buffer = buffer.slice(sseBlockEndIndex + 2);

          // 过滤无效块（空块、非 data 块）
          if (!sseBlock || !sseBlock.startsWith('data: ')) continue;

          // 🌟 步骤3：提取 data: 后面的 JSON 字符串（关键修复）
          const jsonStr = sseBlock.replace(/^data:\s*/, ''); // 去除 "data: " 前缀（包括可能的空格）
          if (!jsonStr) continue; // 跳过空 data 块

          // 🌟 步骤4：安全解析 JSON（增加容错）
          let data: any;
          try {
            data = JSON.parse(jsonStr);
          } catch (parseErr) {
            console.warn(
              'JSON 解析失败，跳过该块：',
              parseErr,
              '原始内容：',
              jsonStr
            );
            continue;
          }

          // 🌟 步骤5：按 data.type 处理不同事件（逻辑不变）
          switch (data.type) {
            case 'stream':
              fullAiContent += data.content || '';
              aiSources = data.sources || [];
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMsgId
                    ? { ...msg, content: fullAiContent, sources: aiSources }
                    : msg
                )
              );
              if (data.conversationId && !conversationId) {
                setConversationId(data.conversationId);
                localStorage.setItem('conversationId', data.conversationId);
              }
              break;
            case 'complete':
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMsgId ? { ...msg, isStreaming: false } : msg
                )
              );
              break;
            case 'error':
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMsgId
                    ? {
                        ...msg,
                        content: `错误：${data.error}`,
                        isStreaming: false,
                      }
                    : msg
                )
              );
              await reader.cancel(); // 取消流，避免继续读取
              buffer = ''; // 清空缓冲区
              break;
          }
        }
      }
    } catch (error) {
      const errorMsg = (error as Error).message;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? { ...msg, content: `请求失败：${errorMsg}`, isStreaming: false }
            : msg
        )
      );
      console.error('流式请求错误：', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 加载历史对话消息
  const loadHistoryMessages = async (conversationId: string) => {
    try {
      setHistoryLoading(true);
      const data = await fetchHistoryMessages({ conversationId });
      if (data.messages) {
        const formattedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          isUser: msg.role === 'user',
          sources: msg.role === 'assistant' ? msg.sources || [] : [],
        }));
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.error('加载历史消息失败：', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50"
      onClick={isMobile ? undefined : onClose}
    >
      <div
        className={`bg-white shadow-2xl flex flex-col ${
          isMobile
            ? 'fixed inset-0'
            : 'absolute bottom-0 right-0 w-full min-w-[50%] max-w-lg h-screen'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex items-center justify-between border-b p-4">
          <button
            onClick={onClose}
            aria-label="返回"
            className="flex items-center"
          >
            <AiOutlineLeft className="h-5 w-5 mr-2" />
            <h3 className="font-semibold">AI Money</h3>
          </button>
        </div>

        <div
          ref={chatContainerRef}
          style={{ scrollBehavior: 'smooth' }}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* 核心替换：用新的消息组件渲染 */}
              <MemoizedChatMessageItem msg={msg} />
            </div>
          ))}

          {isLoading && <ThinkingDiv />}
          {historyLoading && (
            <span className="bg-clip-text bg-gradient-to-r from-[#3b91ff] to-[#7E22CE] text-sm text-transparent w-full h-full flex items-center justify-center">
              正在加载...
            </span>
          )}
        </div>

        <div className="border-t p-4 flex-shrink-0">
          <form
            onSubmit={handleSend}
            className="flex gap-2"
            onKeyDown={(e) => {
              // 只有「非输入法候选状态」且「按下回车」，才触发提交
              console.log('e', e);
              if (e.key === 'Enter' && !isComposing) {
                e.preventDefault(); // 阻止默认刷新
                handleSend(); // 手动触发提交逻辑
              }
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的问题..."
              // 开始输入法候选（比如输入拼音）：标记为正在输入
              onCompositionStart={() => setIsComposing(true)}
              // 结束输入法候选（确认选字/锁定输入）：标记为结束输入
              onCompositionEnd={() => setIsComposing(false)}
              className="flex-1 rounded-lg border border-slate-300 p-2 outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-black px-4 py-2 text-white"
            >
              发送
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
