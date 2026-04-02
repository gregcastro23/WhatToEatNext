-- User Notifications Schema
-- Alchm.kitchen Notification System
-- Migration 13: notifications table for post-it style user alerts

-- Notification type enum
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'welcome',
    'login_greeting',
    'daily_insight',
    'friend_request',
    'friend_accepted',
    'commensal_request',
    'commensal_accepted'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    related_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_expires
  ON notifications (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_type
  ON notifications (user_id, type);

-- Trigger for updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE notifications IS 'User notifications: social events, daily insights, login greetings';
COMMENT ON COLUMN notifications.type IS 'Notification category determining display style and behavior';
COMMENT ON COLUMN notifications.metadata IS 'JSONB for extra context: harmony scores, recommendations, related entity IDs';
COMMENT ON COLUMN notifications.expires_at IS 'Auto-cleanup timestamp for ephemeral notifications like login greetings';
