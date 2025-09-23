/**
 * Celestial Event Notifications Component - Minimal Recovery Version
 *
 * Displays real-time celestial event notifications with auto-hide functionality.
 */

'use client';

import React from 'react';

interface CelestialEvent {
  id?: string,
  type: string,
  description: string,
  intensity: number,
  timestamp: number;
}

interface CelestialEventWithId extends CelestialEvent {
  id: string,
  visible: boolean,
  receivedAt: number;
}

interface CelestialEventNotificationsProps {
  maxNotifications?: number,
  autoHide?: boolean,
  autoHideDelay?: number,
  className?: string;
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
  const [events, setEvents] = React.useState<CelestialEventWithId[]>([]);

  // Mock function for WebSocket connection
  const useAlchmWebSocket = () => ({
    isConnected: false,
    lastCelestialEvent: null
  });

  const { isConnected, lastCelestialEvent } = useAlchmWebSocket();

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
        return updated;
      });

      // Auto-hide after delay
      if (autoHide) {
        setTimeout(() => {
          setEvents(prev =>
            prev.map(event =>
              event.id === eventWithId.id ? { ...event, visible: false } : event)
          );
        }, autoHideDelay);

        // Remove after animation
        setTimeout(() => {
          setEvents(prev => prev.filter(event => event.id !== eventWithId.id));
        }, autoHideDelay + 300);
      }
    }
  }, [lastCelestialEvent, maxNotifications, autoHide, autoHideDelay]);

  const dismissEvent = (eventId: string) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId ? { ...event, visible: false } : event)
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

  const formatTimestamp = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return new Date().toLocaleTimeString();
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
             fontSize: '14px',
           }}>
        <div style={{ marginBottom: '8px' }}>✨</div>
        <div>No celestial events</div>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          {isConnected ? 'Listening for events...' : 'WebSocket disconnected'}
        </div>
      </div>
    );
  }

  return (
    <div className={`celestial-notifications ${className}`}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid #eee',
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
          🌟 Celestial Events
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#22c55e' : '#ef4444',
          }} />
          <button
            onClick={clearAllEvents}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Clear All
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {events.map((event) => (
          <div
            key={event.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#fff',
              border: `1px solid ${getEventColor(event.type)}20`,
              borderLeft: `4px solid ${getEventColor(event.type)}`,
              opacity: event.visible ? 1 : 0.3,
              transition: 'all 0.3s ease',
              position: 'relative',
            }}
          >
            <div style={{
              fontSize: '20px',
              marginRight: '12px',
              flexShrink: 0,
            }}>
              {getEventIcon(event.type)}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '4px',
              }}>
                <h4 style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: '600',
                  color: getEventColor(event.type)
                }}>
                  {formatEventType(event.type)}
                </h4>
                <button
                  onClick={() => dismissEvent(event.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#999',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '0',
                    lineHeight: 1,
                  }}
                  title="Dismiss"
                >
                  ×
                </button>
              </div>

              <p style={{
                margin: 0,
                fontSize: '13px',
                color: '#666',
                lineHeight: '1.4',
                marginBottom: '8px',
              }}>
                {event.description}
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                color: '#999',
              }}>
                <span>
                  Intensity: {event.intensity.toFixed(1)}
                </span>
                <span>
                  {formatTimestamp(event.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length >= maxNotifications && (
        <div style={{
          fontSize: '12px',
          color: '#999',
          textAlign: 'center',
          marginTop: '8px',
          padding: '8px',
          borderTop: '1px solid #eee',
        }}>
          Showing latest {maxNotifications} events
        </div>
      )}
    </div>
  );
}

export default CelestialEventNotifications;