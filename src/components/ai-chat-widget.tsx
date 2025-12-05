
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import N8nChat from '@/components/n8n-chat';
import { Bot } from 'lucide-react';
import { useUser } from '@/firebase';

export default function AIChatWidget() {
    const { user } = useUser();

    // Do not render the widget if the user is not logged in.
    if (!user) {
        return null;
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    size="icon"
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-110 hover:bg-primary"
                >
                    <Bot className="h-7 w-7" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-3/4 flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>AI Meal Assistant</DialogTitle>
                    <DialogDescription>
                        Ask me anything about nutrition or get meal ideas!
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-hidden rounded-b-lg">
                    <N8nChat />
                </div>
            </DialogContent>
        </Dialog>
    );
}
