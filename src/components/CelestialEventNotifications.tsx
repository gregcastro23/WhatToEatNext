'use client';

import React from 'react';
import { useAlchmWebSocket } from '@/hooks/useAlchmWebSocket';
import { logger } from '@/lib/logger';

interface CelestialEventNotificationsProps {
  maxNotifications?: number;
  autoHide?: boolean;
  autoHideDelay?: number;
  className?: string;
}

interface CelestialEventWithId {
  id: string;
  type: string;
  timestamp: string;
  detail?: string;
  visible: boolean;
  receivedAt: number;
}

const EVENT_ICONS = {
  'lunar_phase': '🌙',
  'planetary_aspect': '⭐',
  'planetary_transition': '🪐',
  'eclipse': '🌘',
  'conjunction': '🔗',
  'opposition': '⚖️',
  'trine': '🔺',
  'square': '🟩',
  'retrograde': '↩️',
  'default': '✨'
} as const;

const EVENT_COLORS = {
  'lunar_phase': '#C0C0C0',
  'planetary_aspect': '#FFD700',
  'planetary_transition': '#4169E1',
  'eclipse': '#8B0000',
  'conjunction': '#FF69B4',
  'opposition': '#FF4500',
  'trine': '#32CD32',
  'square': '#DC143C',
  'retrograde': '#9370DB',
  'default': '#6495ED'
} as const;

export function CelestialEventNotifications({
  maxNotifications = 5,
  autoHide = true,
  autoHideDelay = 10000,
  className = ''
}: CelestialEventNotificationsProps) {
  const { isConnected, lastCelestialEvent } = useAlchmWebSocket();
  const [events, setEvents] = React.useState<CelestialEventWithId[]>([]);

  React.useEffect(() => {
    if (lastCelestialEvent) {
      const eventWithId: CelestialEventWithId = {
        ...lastCelestialEvent,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        visible: true,
        receivedAt: Date.now()
      };

      setEvents(prev => {
        const updated = [eventWithId, ...prev.slice(0, maxNotifications - 1)];
        logger.debug('CelestialEventNotifications added event', eventWithId);
        return updated;
      });

      // Auto-hide after delay
      if (autoHide) {
        setTimeout(() => {
          setEvents(prev =>
            prev.map(event =>
              event.id === eventWithId.id ? { ...event, visible: false } : event
            )
          );
        }, autoHideDelay);

        // Remove after animation
        setTimeout(() => {
          setEvents(prev => prev.filter(event => event.id !== eventWithId.id));
        }, autoHideDelay + 500);
      }
    }
  }, [lastCelestialEvent, maxNotifications, autoHide, autoHideDelay]);

  const dismissEvent = (eventId: string) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId ? { ...event, visible: false } : event
      )
    );

    setTimeout(() => {
      setEvents(prev => prev.filter(event => event.id !== eventId));
    }, 300);
  };

  const clearAllEvents = () => {
    setEvents(prev =>
      prev.map(event => ({ ...event, visible: false }))
    );

    setTimeout(() => {
      setEvents([]);
    }, 300);
  };

  const formatEventTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  const getEventIcon = (type: string) => {
    return EVENT_ICONS[type as keyof typeof EVENT_ICONS] || EVENT_ICONS.default;
  };

  const getEventColor = (type: string) => {
    return EVENT_COLORS[type as keyof typeof EVENT_COLORS] || EVENT_COLORS.default;
  };

  const formatEventType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (events.length === 0) {
    return (
      <div className={`celestial-notifications-empty ${className}`}
           style={{
             border: '1px dashed #ddd',
             borderRadius: '8px',
             padding: '20px',
             textAlign: 'center',
             color: '#999',
             backgroundColor: '#f8f9fa'
           }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌌</div>
        <div style={{ fontSize: '14px' }}>
          {isConnected ? 'Listening for celestial events...' : 'WebSocket disconnected'}
        </div>
      </div>
    );
  }

  return (
    <div className={`celestial-event-notifications ${className}`}
         style={{
           position: 'relative',
           minWidth: '300px',
           maxWidth: '400px'
         }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        padding: '0 4px'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: '600',
          color: '#333'
        }}>
          🌌 Celestial Events
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            fontSize: '12px',
            color: isConnected ? '#28a745' : '#dc3545',
            fontWeight: '500'
          }}>
            {isConnected ? '● Live' : '● Offline'}
          </div>
          {events.length > 1 && (
            <button
              onClick={clearAllEvents}
              style={{
                background: 'none',
                border: 'none',
                color: '#6c757d',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '2px 6px',
                borderRadius: '4px'
              }}
              title="Clear all notifications"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Events */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {events.map((event) => (
          <div
            key={event.id}
            style={{
              border: `2px solid ${getEventColor(event.type)}`,
              borderRadius: '8px',
              padding: '12px',
              backgroundColor: '#fff',
              position: 'relative',
              transform: event.visible ? 'translateX(0)' : 'translateX(100%)',
              opacity: event.visible ? 1 : 0,
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  fontSize: '20px',
                  filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))'
                }}>
                  {getEventIcon(event.type)}
                </span>
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: getEventColor(event.type)
                  }}>
                    {formatEventType(event.type)}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    {formatEventTime(event.timestamp)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => dismissEvent(event.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#999',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '2px',
                  lineHeight: 1
                }}
                title="Dismiss notification"
              >
                ×
              </button>
            </div>

            {event.detail && (
              <div style={{
                fontSize: '13px',
                color: '#555',
                lineHeight: '1.4',
                paddingLeft: '28px'
              }}>
                {event.detail}
              </div>
            )}

            {/* Fade indicator for auto-hide */}
            {autoHide && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: '2px',
                  backgroundColor: getEventColor(event.type),
                  animation: `fadeBar ${autoHideDelay}ms linear`,
                  borderRadius: '0 0 6px 6px'
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Auto-hide animation styles */}
      <style jsx>{`
        @keyframes fadeBar {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}