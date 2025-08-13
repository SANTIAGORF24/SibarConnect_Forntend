"use client";

import { useEffect, useRef, useState } from "react";

export type RealtimeEvent<T = unknown> = {
  event: string;
  data: T;
};

export type UseChatRealtimeOptions<T> = {
  onEvent?: (evt: RealtimeEvent<T>) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (err: Event) => void;
  enabled?: boolean;
};

export function useChatRealtime<T = unknown>(
  companyId: number | undefined,
  chatId: number | undefined,
  options: UseChatRealtimeOptions<T> = {}
) {
  const { onEvent, onOpen, onClose, onError, enabled = true } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled || !companyId || !chatId) {
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
      }
      wsRef.current = null;
      setConnected(false);
      return;
    }

    const httpBase =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
    const baseWithoutApi = httpBase.replace(/\/?api$/, "");
    const wsBase = baseWithoutApi
      .replace(/^http:/, "ws:")
      .replace(/^https:/, "wss:");
    const url = `${wsBase}/api/chats/ws/${companyId}/${chatId}`;

    let closedByUser = false;
    let reconnectTimer: number | undefined;

    const connect = () => {
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          setConnected(true);
          setAttempt(0);
          onOpen && onOpen();
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data) as RealtimeEvent<T>;
            onEvent && onEvent(payload);
          } catch {}
        };

        ws.onclose = () => {
          setConnected(false);
          onClose && onClose();
          if (!closedByUser) {
            const next = Math.min(30000, 1000 * Math.pow(2, attempt || 0));
            reconnectTimer = window.setTimeout(() => {
              setAttempt((a) => a + 1);
            }, next);
          }
        };

        ws.onerror = (err) => {
          onError && onError(err);
        };
      } catch (e) {
        const next = Math.min(30000, 1000 * Math.pow(2, attempt || 0));
        reconnectTimer = window.setTimeout(() => {
          setAttempt((a) => a + 1);
        }, next);
      }
    };

    connect();

    return () => {
      closedByUser = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      try {
        wsRef.current?.close();
      } catch {}
      wsRef.current = null;
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, chatId, enabled, attempt]);

  return { connected };
}
