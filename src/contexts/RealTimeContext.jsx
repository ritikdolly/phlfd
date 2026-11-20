import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const RealTimeContext = createContext(null);

const WS_URL = (import.meta.env.VITE_WS_URL || 'http://localhost:8080') + '/ws';

export function RealTimeProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [connected, setConnected] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);
  const [lastNotification, setLastNotification] = useState(null);

  // Subscriber registry: Map<topic, Set<callback>>
  const subscribers = useRef(new Map());
  const stompClient = useRef(null);
  const subscriptions = useRef(new Map()); // topic -> STOMP subscription

  // Track online/offline
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Connect / disconnect based on auth state
  useEffect(() => {
    if (!isAuthenticated || !user) {
      disconnectWS();
      return;
    }

    connectWS();
    return () => disconnectWS();
  }, [isAuthenticated, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const connectWS = useCallback(() => {
    if (stompClient.current?.connected) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      debug: () => {}, // silence debug logs
      onConnect: () => {
        setConnected(true);
        // Re-subscribe to all registered topics
        for (const [topic] of subscribers.current) {
          activateSubscription(topic);
        }
      },
      onDisconnect: () => {
        setConnected(false);
        subscriptions.current.clear();
      },
      onStompError: (frame) => {
        console.warn('[WS] STOMP error:', frame.headers?.message);
        setConnected(false);
      },
    });

    client.activate();
    stompClient.current = client;
  }, []);

  const disconnectWS = useCallback(() => {
    if (stompClient.current) {
      stompClient.current.deactivate();
      stompClient.current = null;
      subscriptions.current.clear();
      setConnected(false);
    }
  }, []);

  const activateSubscription = (topic) => {
    if (!stompClient.current?.connected) return;
    if (subscriptions.current.has(topic)) return;

    try {
      const sub = stompClient.current.subscribe(topic, (message) => {
        try {
          const event = JSON.parse(message.body);
          // Dispatch to all registered callbacks for this topic
          const cbs = subscribers.current.get(topic);
          if (cbs) cbs.forEach((cb) => cb(event));

          // Show global toast for order status updates
          if (event.currentStatus) {
            handleGlobalNotification(event);
          }
        } catch (e) {
          console.warn('[WS] Failed to parse message:', e);
        }
      });
      subscriptions.current.set(topic, sub);
    } catch (e) {
      console.warn('[WS] Subscribe error on', topic, e);
    }
  };

  const handleGlobalNotification = (event) => {
    setLastNotification({ ...event, timestamp: new Date() });

    const orderNum = event.orderNumber ? `#${event.orderNumber}` : '';
    const statusMessages = {
      CONFIRMED:        `Order ${orderNum} confirmed by kitchen!`,
      PREPARING:        `Order ${orderNum} is being prepared.`,
      READY_FOR_PICKUP: `Order ${orderNum} is ready for dispatch.`,
      OUT_FOR_DELIVERY: `Order ${orderNum} is out for delivery!`,
      DELIVERED:        `Order ${orderNum} has been delivered.`,
      CANCELLED:        `Order ${orderNum} was cancelled.`,
    };

    const msg = statusMessages[event.currentStatus];
    if (msg) {
      if (event.currentStatus === 'DELIVERED') {
        toast.success(msg, { duration: 5000 });
      } else {
        toast(msg, { duration: 5000 });
      }
    }
  };

  /**
   * Subscribe to a STOMP topic. Returns an unsubscribe function.
   * Safe to call before WS is connected — the subscription is queued.
   */
  const subscribe = useCallback((topic, callback) => {
    if (!subscribers.current.has(topic)) {
      subscribers.current.set(topic, new Set());
    }
    subscribers.current.get(topic).add(callback);

    // If already connected, activate immediately
    if (stompClient.current?.connected) {
      activateSubscription(topic);
    }

    // Return unsubscribe
    return () => {
      const cbs = subscribers.current.get(topic);
      if (cbs) {
        cbs.delete(callback);
        if (cbs.size === 0) {
          subscribers.current.delete(topic);
          const sub = subscriptions.current.get(topic);
          if (sub) {
            try { sub.unsubscribe(); } catch (_) {}
            subscriptions.current.delete(topic);
          }
        }
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Broadcast a custom local event (legacy compatibility) */
  const broadcastEvent = useCallback((event) => {
    setLastNotification({ ...event, timestamp: new Date() });
  }, []);

  return (
    <RealTimeContext.Provider
      value={{
        connected,
        onlineStatus,
        lastNotification,
        subscribe,
        broadcastEvent,
      }}
    >
      {children}
    </RealTimeContext.Provider>
  );
}

export const useRealTime = () => {
  const ctx = useContext(RealTimeContext);
  if (!ctx) throw new Error('useRealTime must be used within RealTimeProvider');
  return ctx;
};
