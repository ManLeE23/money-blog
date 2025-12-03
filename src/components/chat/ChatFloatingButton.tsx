// src/components/chat/ChatFloatingButton.tsx
'use client';
import { useState } from 'react';
// import { ChatIcon } from "@/components/icons/ChatIcon";
import { ChatPanel } from './ChatPanel';
import Image from 'next/image';
import { GoDependabot } from "react-icons/go";

export function ChatFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed flex justify-center items-center w-12 h-12 bottom-12 right-6 z-50 rounded-full bg-black shadow-lg hover:w-14 hover:h-14 transition-all"
        aria-label="打开对话"
      >
        <GoDependabot className="text-white size-6" />
        {/* <Image
          src="/static/images/minyi-logo.png"
          alt="minyi-logo"
          fill
          className="rounded-full"
        /> */}
      </button>

      {isOpen && <ChatPanel onClose={() => setIsOpen(false)} />}
    </>
  );
}
