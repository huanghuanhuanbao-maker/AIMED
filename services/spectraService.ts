import { SpectraResponse } from '../types';

/**
 * Calls the Spectra Agent API with streaming support.
 * 
 * @param message The user's input message.
 * @param conversationId Optional conversation ID for continuity.
 * @param onUpdate Optional callback to receive real-time text and thought updates.
 * @returns Promise containing the final text response, thought process, and conversation ID.
 */
export const callSpectraAgent = async (
  message: string,
  conversationId: string = "",
  onUpdate?: (text: string, thought: string) => void
): Promise<SpectraResponse> => {
  const API_URL = "https://api-spectra.duplik.cn/v1/conversations";
  const TOKEN = "sk-7Xa5hQK8Z2IKCk5djvFwDmzPIl0NvY1P";
  const AGENT_ID = "SP816956235839694";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": TOKEN.startsWith("Bearer ") ? TOKEN : `Bearer ${TOKEN}`
      },
      body: JSON.stringify({
        inputs: {}, 
        query: message,
        message: message,
        conversation_id: conversationId,
        agent_id: AGENT_ID,
        enable_websearch: false,
        stream: true,
        response_mode: 'streaming'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`API Request failed: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";
    let fullThought = "";
    let returnedConversationId = conversationId;
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const lines = buffer.split('\n');
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine.startsWith("data:")) continue;

        const jsonStr = trimmedLine.slice(5).trim();
        if (!jsonStr || jsonStr === "[DONE]") continue;

        try {
          const data = JSON.parse(jsonStr);
          const type = data.type; 
          const extra = data.extra || {};
          
          // Generate a timestamp for logs: [HH:MM:SS]
          const now = new Date();
          const timeStr = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;

          // --- Structured Log Format: TYPE|TIMESTAMP|CONTENT ---
          if (type === 'stream') {
            // Streaming content (the actual answer)
            if (data.message) {
              fullText += data.message;
            }
          } else if (type === 'agent' && extra.status === 'start') {
             fullThought += `start|${timeStr}|智能体启动: ${extra.name || 'Unknown Agent'}\n`;
          } else if (type === 'planning' && extra.status === 'start') {
             fullThought += `thinking|${timeStr}|正在深度思考...\n`;
          } else if (type === 'tool') {
             if (extra.status === 'start') {
                fullThought += `tool_start|${timeStr}|调用工具: ${extra.name || 'Unknown Tool'}\n`;
                // Optional: log inputs if needed
                // if (extra.input) fullThought += `info| |参数: ${JSON.stringify(extra.input)}\n`;
             } else if (extra.status === 'end') {
                const count = extra.sources?.length || 0;
                const countStr = count > 0 ? ` (检索到 ${count} 条资料)` : '';
                fullThought += `tool_end|${timeStr}|工具完成: ${extra.name}${countStr}\n`;
                
                // List retrieved files
                if (extra.sources && Array.isArray(extra.sources)) {
                   extra.sources.forEach((s: any) => {
                      if (s.title) fullThought += `file| |${s.title}\n`;
                   });
                }
             }
          } else if (type === 'error') {
             fullThought += `error|${timeStr}|Error: ${data.message || 'Unknown Error'}\n`;
          }

          // Callback update
          if (onUpdate) {
             onUpdate(fullText, fullThought);
          }

          // Capture conversation ID
          if (extra.conversation_id) returnedConversationId = extra.conversation_id;

        } catch (e) {
          console.warn("Error parsing stream line:", trimmedLine, e);
        }
      }
    }

    return {
      text: fullText,
      thought: fullThought,
      conversationId: returnedConversationId
    };

  } catch (error) {
    console.error("Error calling Spectra Agent:", error);
    throw error;
  }
};
