"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface FanLetterProps {
  summonerName: string;
}

interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  isMine?: boolean;
}

export default function FanLetter({ summonerName: _summonerName }: FanLetterProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      author: "팬1",
      content: "정말 잘하시네요! 응원합니다!",
      timestamp: "오후 2:30",
    },
    {
      id: "2",
      author: "팬2",
      content: "다음 경기도 화이팅!",
      timestamp: "오후 2:32",
    },
    {
      id: "3",
      author: "팬3",
      content: "야스오 플레이 정말 멋있었어요!",
      timestamp: "오후 3:15",
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      author: "나",
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      isMine: true,
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");
  };

  const formatTime = (time: string) => {
    return time;
  };

  return (
    <div className="flex flex-col h-[600px] bg-surface rounded-lg">
      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${
              message.isMine ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* 프로필 이미지 */}
            {!message.isMine && (
              <div className="w-8 h-8 bg-surface-6 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-on-surface text-xs">
                  {message.author.charAt(0)}
                </span>
              </div>
            )}

            <div
              className={`flex flex-col gap-1 max-w-[70%] ${
                message.isMine ? "items-end" : "items-start"
              }`}
            >
              {/* 작성자 이름 */}
              {!message.isMine && (
                <span className="text-on-surface-medium text-xs px-1">
                  {message.author}
                </span>
              )}

              {/* 메시지 말풍선 */}
              <div
                className={`px-4 py-2 rounded-lg ${
                  message.isMine
                    ? "bg-primary text-on-surface rounded-tr-none"
                    : "bg-surface-6 text-on-surface rounded-tl-none"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>

              {/* 시간 */}
              <span className="text-on-surface-disabled text-xs px-1">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-divider p-4 bg-surface-4">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="팬 래터를 입력하세요..."
            className="flex-1 px-4 py-2 bg-surface-6 text-on-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-divider"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-surface-6 hover:bg-surface-8 cursor-pointer text-on-surface rounded-lg flex items-center justify-center transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

