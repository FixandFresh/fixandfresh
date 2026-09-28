import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';
import type { Job } from '@/types';

interface JobChatProps {
  job: Job;
}

const JobChat: React.FC<JobChatProps> = ({ job }) => {
  const { currentUser, messages, sendMessage, markMessageRead } = useAppContext();
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const recipientId = useMemo(() => {
    if (!currentUser || !job.providerId) return null;
    return currentUser.type === 'client' ? job.providerId : job.clientId;
  }, [currentUser, job.providerId, job.clientId]);

  const jobMessages = useMemo(
    () => messages.filter(message => message.jobId === job.id),
    [messages, job.id]
  );

  const unreadMessages = useMemo(
    () => jobMessages.filter(message =>
      message.recipientId === currentUser?.id && !message.readAt
    ),
    [jobMessages, currentUser?.id]
  );

  useEffect(() => {
    unreadMessages.forEach(message => {
      void markMessageRead(message.id);
    });
  }, [unreadMessages, markMessageRead]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [jobMessages.length]);

  const handleSend = async () => {
    if (!recipientId || !draft.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(job.id, recipientId, draft);
      setDraft('');
    } finally {
      setIsSending(false);
    }
  };

  if (!job.providerId) {
    return (
      <div className='mt-6 rounded-xl border bg-slate-50 p-5'>
        <div className='flex items-center gap-2 font-semibold text-slate-900'>
          <MessageCircle className='h-5 w-5' />
          Service Chat
        </div>
        <p className='mt-2 text-sm text-slate-600'>
          Messaging will open automatically once a provider accepts this request.
        </p>
      </div>
    );
  }

  return (
    <div className='mt-6 rounded-xl border bg-white overflow-hidden'>
      <div className='border-b px-4 py-3 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <MessageCircle className='h-5 w-5 text-slate-700' />
          <div>
            <div className='font-semibold text-slate-900'>Service Chat</div>
            <div className='text-xs text-slate-500'>Messages are tied to this booking.</div>
          </div>
        </div>
        {unreadMessages.length > 0 && (
          <Badge>{unreadMessages.length} unread</Badge>
        )}
      </div>

      <div ref={listRef} className='max-h-80 overflow-y-auto space-y-3 p-4 bg-slate-50'>
        {jobMessages.length === 0 ? (
          <div className='text-center py-8 text-sm text-slate-500'>
            No messages yet. Send the first message.
          </div>
        ) : (
          jobMessages.map(message => {
            const mine = message.senderId === currentUser?.id;
            return (
              <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${mine ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border'}`}>
                  <div className='whitespace-pre-wrap break-words text-sm'>{message.content}</div>
                  <div className={`mt-1 text-[11px] ${mine ? 'text-slate-300' : 'text-slate-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className='border-t p-3 space-y-2'>
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value.slice(0, 2000))}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void handleSend();
            }
          }}
          placeholder='Write a message…'
          rows={2}
          maxLength={2000}
          disabled={isSending}
        />
        <div className='flex items-center justify-between gap-3'>
          <span className='text-xs text-slate-500'>{draft.length}/2000 · Enter to send</span>
          <Button onClick={() => void handleSend()} disabled={!draft.trim() || isSending}>
            <Send className='h-4 w-4 mr-2' />
            {isSending ? 'Sending…' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobChat;
