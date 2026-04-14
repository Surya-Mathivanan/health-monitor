import { useState } from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CallEndedModal } from './CallEndedModal';
import type { Client } from '@/types';

export function CallButton({ client }: { client: Client }) {
  const [showModal, setShowModal] = useState(false);

  const handleCall = () => {
    // On mobile, open native dialer
    if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
      window.location.href = `tel:${client.mobile}`;
      // Show modal after a small delay so dialer opens first
      setTimeout(() => setShowModal(true), 1500);
    } else {
      // Desktop: show the modal directly
      setShowModal(true);
    }
  };

  return (
    <>
      <Button
        id={`call-btn-${client.id}`}
        onClick={handleCall}
        className="flex-shrink-0"
        leftIcon={<Phone className="w-4 h-4" />}
        size="sm"
      >
        Call Now
      </Button>
      <CallEndedModal open={showModal} onClose={() => setShowModal(false)} clientId={client.id} />
    </>
  );
}
