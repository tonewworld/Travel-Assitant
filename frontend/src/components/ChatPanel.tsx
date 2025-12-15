import { useState } from "react";
import { Button, Input, List, Typography, Spin } from "antd";
import { ChatMessage } from "../types";
import { sendChat } from "../api/api";
import { ExampleInput } from "./ExampleInput";

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
  onUserMessage?: (msg: string) => void;
}

export function ChatPanel({ onUserMessage }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    setLoading(true);
    try {
      const resp = await sendChat(content, sessionId);
      setSessionId(resp.sessionId);
      setMessages(resp.messages);
      if (onUserMessage) {
        onUserMessage(content);
      }
      if (!text) setInput("");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <ExampleInput
        onSelect={(t) => {
          setInput(t);
        }}
      />
      <div className="chat-messages">
        {messages.length === 0 ? (
          <Text type="secondary">
            你好，我是你的旅游规划助手。可以直接用自然语言描述你的出行计划，例如：
            “五一想去成都玩 3 天，帮我安排一下行程”。
          </Text>
        ) : (
          <List
            size="small"
            dataSource={messages.filter((m) => m.role !== "system")}
            renderItem={(item) => (
              <List.Item
                style={{
                  border: "none",
                  padding: "4px 0"
                }}
              >
                <div>
                  <Text strong>
                    {item.role === "user" ? "你" : "助手"}
                    ：
                  </Text>
                  <div style={{ whiteSpace: "pre-wrap" }}>{item.content}</div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
      <div className="chat-input">
        <TextArea
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="请输入你的出行需求，例如：‘国庆节去西安 4 天，人文历史为主’"
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <div style={{ textAlign: "right", marginTop: 4 }}>
          <Button
            type="primary"
            onClick={() => handleSend()}
            disabled={loading}
          >
            {loading ? <Spin size="small" /> : "发送"}
          </Button>
        </div>
      </div>
    </div>
  );
}