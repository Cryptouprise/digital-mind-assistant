
import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Mock data since we don't have the actual API endpoint yet
  useEffect(() => {
    // This simulates fetching notifications
    setNotifications([
      { id: 1, message: "New lead assigned to you" },
      { id: 2, message: "Follow-up reminder with Jane Doe" },
      { id: 3, message: "Meeting scheduled for tomorrow at 3pm" }
    ]);
  }, []);

  return (
    <Card className="p-4 bg-slate-800 border-slate-700 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="text-blue-400" />
        <h2 className="text-xl font-semibold">Notifications</h2>
      </div>
      {notifications.length === 0 ? (
        <p className="text-slate-300">You're all caught up.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n.id} className="text-sm text-slate-300">{n.message}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}
