import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'notifications.json');

function getNotifications() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveNotifications(notifications: any[]) {
  fs.writeFileSync(filePath, JSON.stringify(notifications, null, 2));
}

export async function GET() {
  try {
    const notifications = getNotifications();
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const notifications = getNotifications();

    const newNotification = {
      id: body.id || `NOTIF_${Date.now()}`,
      type: body.type || 'confirmation', // confirmation | cancellation | reschedule | reminder
      title: body.title || 'Notification',
      message: body.message || '',
      time: 'Just now',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    notifications.unshift(newNotification);
    saveNotifications(notifications);

    return NextResponse.json(newNotification, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save notification' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    let notifications = getNotifications();

    if (body.markAllRead) {
      notifications = notifications.map((n: any) => ({ ...n, isRead: true }));
    } else if (body.id) {
      notifications = notifications.map((n: any) => 
        n.id === body.id ? { ...n, isRead: true } : n
      );
    }

    saveNotifications(notifications);
    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
