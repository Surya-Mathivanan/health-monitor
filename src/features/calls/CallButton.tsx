import { useState } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CallEndedModal } from './CallEndedModal';
import { useAuth } from '@/features/auth/AuthProvider';
import type { Client } from '@/types';

export function CallButton({ client }: { client: Client }) {
  const [showModal, setShowModal] = useState(false);
  const { profile } = useAuth();

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

  const handleWhatsApp = () => {
    const doctorName = profile?.display_name || 'Doctor';
    const message = encodeURIComponent(
      `Hi, this is ${doctorName}. I visited your profile. Can you please spend a little time to discuss?`
    );
    const whatsappUrl = `https://wa.me/${client.mobile}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          id={`call-btn-${client.id}`}
          onClick={handleCall}
          leftIcon={<Phone className="w-4 h-4" />}
          size="sm"
        >
          Call Now
        </Button>
        <Button
          id={`whatsapp-btn-${client.id}`}
          onClick={handleWhatsApp}
          leftIcon={<MessageCircle className="w-4 h-4" />}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          WhatsApp
        </Button>
      </div>
      <CallEndedModal open={showModal} onClose={() => setShowModal(false)} clientId={client.id} />
    </>
  );
}
