'use client';

import { useState, useEffect } from 'react';
import { Bell, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  collection,
  query,
  orderBy,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';

interface Notification {
  id: string;
  type: 'match';
  senderName: string;
  senderPhoto: string;
  status: 'unread' | 'read' | 'accepted' | 'ignored';
  timestamp: any;
  matchId: string;
}

export default function NotificationBell() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const notificationsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, `notifications/${user.uid}/user_notifications`),
      orderBy('timestamp', 'desc')
    );
  }, [user, firestore]);

  const { data: notifications } = useCollection<Notification>(notificationsQuery);

  const unreadCount = notifications?.filter((n) => n.status === 'unread').length ?? 0;

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.status === 'unread') {
      const notifRef = doc(firestore, `notifications/${user.uid}/user_notifications`, notification.id);
      await updateDoc(notifRef, { status: 'read' });
    }
  };

  const handleAccept = (matchId: string, notificationId: string) => {
    router.push(`/messages?conversationId=${matchId}`);
    const notifRef = doc(firestore, `notifications/${user.uid}/user_notifications`, notificationId);
    updateDoc(notifRef, { status: 'accepted' });
  };

  const handleIgnore = (notificationId: string) => {
    const notifRef = doc(firestore, `notifications/${user.uid}/user_notifications`, notificationId);
    updateDoc(notifRef, { status: 'ignored' });
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <AnimatePresence>
            {unreadCount > 0 && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                >
                    {unreadCount}
                </motion.div>
            )}
          </AnimatePresence>
          <Bell className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications && notifications.length > 0 ? (
          notifications.filter(n => n.status !== 'ignored').map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex flex-col items-start gap-2 p-3"
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={notification.senderPhoto} />
                  <AvatarFallback>{notification.senderName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{notification.senderName}</span> also
                    liked you!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notification.timestamp?.toDate()).toLocaleTimeString()}
                  </p>
                </div>
                {notification.status === 'unread' && <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
              </div>
               {notification.status !== 'accepted' && (
                 <div className="flex w-full justify-end gap-2 mt-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleIgnore(notification.id);
                        }}
                    >
                        Ignore
                    </Button>
                    <Button
                        size="sm"
                        onClick={(e) => {
                             e.stopPropagation();
                             handleAccept(notification.matchId, notification.id);
                        }}
                    >
                       <Heart className="mr-2 h-4 w-4" /> Chat
                    </Button>
                 </div>
                )}
            </DropdownMenuItem>
          ))
        ) : (
          <p className="p-4 text-center text-sm text-muted-foreground">
            No new notifications.
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}