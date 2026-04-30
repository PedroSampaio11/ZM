'use client';

import { useState, useTransition } from 'react';
import { createLead } from '@/lib/lead-actions';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Vehicle } from '@/modules/inventory/types';
import { CheckCircle2, Loader2, Send } from 'lucide-react';

interface LeadCaptureModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LeadCaptureModal({ vehicle, isOpen, onClose }: LeadCaptureModalProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!vehicle) return null;

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createLead(formData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 3000);
      } else {
        setError(result.error || 'Erro ao enviar');
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-zinc-950 border-white/5 rounded-[32px] p-8">
        {success ? (
          <div className="py-12 flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="text-green-500 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white">Solicitação Enviada!</h2>
            <p className="text-zinc-500 text-sm">
              Um de nossos consultores entrará em contato com você via WhatsApp em breve.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-white tracking-tight">
                Tenho Interesse
              </DialogTitle>
              <DialogDescription className="text-zinc-500 font-medium">
                Você está interessado no <span className="text-white">{vehicle.brand} {vehicle.model}</span>. 
                Preencha os dados abaixo para receber uma proposta personalizada.
              </DialogDescription>
            </DialogHeader>

            <form action={handleSubmit} className="space-y-6 mt-4">
              <input type="hidden" name="vehicleId" value={vehicle.id} />
              <input type="hidden" name="origin" value="PLATFORM_WEB" />
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold text-zinc-500 uppercase ml-1">Nome Completo</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Seu nome"
                  required
                  className="bg-black border-white/5 rounded-2xl h-12 focus-visible:ring-blue-600/50"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold text-zinc-500 uppercase ml-1">WhatsApp</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="5511999999999"
                    required
                    className="bg-black border-white/5 rounded-2xl h-12 focus-visible:ring-blue-600/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold text-zinc-500 uppercase ml-1">E-mail (Opcional)</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="bg-black border-white/5 rounded-2xl h-12 focus-visible:ring-blue-600/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-xs font-bold text-zinc-500 uppercase ml-1">Mensagem Inicial</Label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Ex: Gostaria de saber sobre o financiamento e se aceitam troca."
                  className="w-full min-h-[100px] bg-black border border-white/5 rounded-2xl p-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all resize-none"
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs font-medium text-center">{error}</p>
              )}

              <DialogFooter className="flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black h-12 rounded-2xl shadow-lg shadow-blue-900/20"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Solicitação
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
