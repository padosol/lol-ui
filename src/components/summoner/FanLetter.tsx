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

export default function FanLetter({ summonerName }: FanLetterProps) {
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
    <div className="flex flex-col h-[600px] bg-gray-900 rounded-lg">
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
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">
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
                <span className="text-gray-400 text-xs px-1">
                  {message.author}
                </span>
              )}

              {/* 메시지 말풍선 */}
              <div
                className={`px-4 py-2 rounded-lg ${
                  message.isMine
                    ? "bg-blue-500 text-white rounded-tr-none"
                    : "bg-gray-700 text-white rounded-tl-none"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>

              {/* 시간 */}
              <span className="text-gray-500 text-xs px-1">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-gray-700 p-4 bg-gray-800">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="팬 래터를 입력하세요..."
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

