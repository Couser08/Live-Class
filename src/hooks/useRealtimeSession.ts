import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useSessionStore } from '../stores/sessionStore';
import { useCodeStore } from '../stores/codeStore';
import { useUIStore } from '../stores/uiStore';

export function useRealtimeSession(roomId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsersCount, setActiveUsersCount] = useState(1);
  const currentUser = useSessionStore((state) => state.currentUser);
  const setFriendCode = useCodeStore((state) => state.setFriendCode);
  const addToast = useUIStore((state) => state.addToast);

  useEffect(() => {
    if (!roomId || !isSupabaseConfigured) {
      // Mock local connection simulation
      setIsConnected(true);
      setActiveUsersCount(2);
      return;
    }

    const channel = supabase.channel(`room_${roomId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: currentUser.id },
      },
    });

    channel
      .on('broadcast', { event: 'code_stream' }, ({ payload }) => {
        if (payload?.code) {
          setFriendCode(payload.code);
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const count = Object.keys(presenceState).length;
        setActiveUsersCount(count > 0 ? count : 1);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const joinedUser = newPresences?.[0]?.name || 'A learner';
        addToast({
          type: 'info',
          title: `${joinedUser} joined the room`,
        });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          channel.track({
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
      setIsConnected(false);
    };
  }, [roomId, currentUser, setFriendCode, addToast]);

  const broadcastCode = useCallback(
    (code: string) => {
      if (!isSupabaseConfigured || !roomId) {
        return;
      }
      const channel = supabase.channel(`room_${roomId}`);
      channel.send({
        type: 'broadcast',
        event: 'code_stream',
        payload: {
          code,
          senderId: currentUser.id,
          timestamp: Date.now(),
        },
      });
    },
    [roomId, currentUser.id]
  );

  return { isConnected, activeUsersCount, broadcastCode };
}
