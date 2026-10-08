'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './NotificationBell.module.css'

export type NotificationItem = {
  id: string
  type: 'confirmation' | 'cancellation' | 'reschedule' | 'reminder' | string
  title: string
  message: string
  time: string
  isRead: boolean
  createdAt?: string
}

export default function NotificationBell({ darkTheme = false }: { darkTheme?: boolean }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'confirmation' | 'reminder' | 'reschedule' | 'cancellation'>('all')
  const popoverRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true })
      })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (e) {
      console.error(e)
    }
  }

  const handleNotificationClick = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch (e) {
      console.error(e)
    }
  }

  const filtered = notifications.filter(n => {
    if (activeTab === 'all') return true
    return n.type === activeTab
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'confirmation':
        return <div className={`${styles.typeIcon} ${styles.iconConfirmation}`}>🎉</div>
      case 'reminder':
        return <div className={`${styles.typeIcon} ${styles.iconReminder}`}>⏰</div>
      case 'reschedule':
        return <div className={`${styles.typeIcon} ${styles.iconReschedule}`}>🔄</div>
      case 'cancellation':
        return <div className={`${styles.typeIcon} ${styles.iconCancellation}`}>❌</div>
      default:
        return <div className={`${styles.typeIcon} ${styles.iconReminder}`}>🔔</div>
    }
  }

  return (
    <div className={styles.bellWrapper} ref={popoverRef}>
      
      {/* Bell Button */}
      <button 
        className={styles.bellBtn}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        style={{ color: darkTheme ? '#ffffff' : '#334155' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>

        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className={styles.popover}>
          
          <div className={styles.popoverHeader}>
            <h3 className={styles.popoverTitle}>
              🔔 Notifications
            </h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className={styles.markReadBtn}>
                Mark all as read
              </button>
            )}
          </div>

          {/* Type Filter Tabs */}
          <div className={styles.tabs}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'all' ? styles.active : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({notifications.length})
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'confirmation' ? styles.active : ''}`}
              onClick={() => setActiveTab('confirmation')}
            >
              Confirmed
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'reminder' ? styles.active : ''}`}
              onClick={() => setActiveTab('reminder')}
            >
              Reminders
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'reschedule' ? styles.active : ''}`}
              onClick={() => setActiveTab('reschedule')}
            >
              Rescheduled
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'cancellation' ? styles.active : ''}`}
              onClick={() => setActiveTab('cancellation')}
            >
              Cancelled
            </button>
          </div>

          {/* List */}
          <div className={styles.list}>
            {filtered.length === 0 ? (
              <div className={styles.empty}>No notifications in this category.</div>
            ) : (
              filtered.map(item => (
                <div 
                  key={item.id} 
                  className={`${styles.item} ${!item.isRead ? styles.unread : ''}`}
                  onClick={() => handleNotificationClick(item.id)}
                >
                  {getTypeIcon(item.type)}
                  <div className={styles.itemContent}>
                    <div className={styles.itemTitle}>{item.title}</div>
                    <div className={styles.itemMessage}>{item.message}</div>
                    <div className={styles.itemTime}>{item.time}</div>
                  </div>
                  {!item.isRead && <span className={styles.unreadDot} />}
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  )
}
