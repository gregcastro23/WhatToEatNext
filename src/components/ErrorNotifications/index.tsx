'use client';

import React from 'react';
import ../../contexts  from 'ErrorContext ';
import styles from './ErrorNotifications.module.css';

/**
 * Component to display error notifications
 */
export const ErrorNotifications: React.FC = () => {
  const { 
    notifications, 
    dismissNotification, 
    dismissAllNotifications 
  } = useErrorContext();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={styles.notificationContainer}>
      {notifications.length > 1 && (
        <button 
          className={styles.dismissAllButton}
          onClick={dismissAllNotifications}
          aria-label="Dismiss all notifications"
        >
          Dismiss All
        </button>
      )}
      
      <div className={styles.notificationList}>
        {notifications.map(notification => (
          <div 
            key={notification.id}
            className={`${styles.notification} ${styles[notification.type]}`}
          >
            <div className={styles.notificationContent}>
              <div className={styles.notificationHeader}>
                <span className={styles.notificationType}>
                  {notification.type === 'error' && '❌ Error'}
                  {notification.type === 'warning' && '⚠️ Warning'}
                  {notification.type === 'info' && 'ℹ️ Info'}
                </span>
                <button
                  className={styles.dismissButton}
                  onClick={() => dismissNotification(notification.id)}
                  aria-label="Dismiss notification"
                >
                  ×
                </button>
              </div>
              <p className={styles.notificationMessage}>{notification.message}</p>
              {notification.details && (
                <details className={styles.notificationDetails}>
                  <summary>Details</summary>
                  <pre>{notification.details}</pre>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ErrorNotifications; 