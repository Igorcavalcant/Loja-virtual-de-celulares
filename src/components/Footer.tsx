import { Instagram, Mail, MessageCircle, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer id="contato" className="bg-ink py-10 text-white">
      <div className="container-pad grid gap-8 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="mb-3 flex items-center gap-2 text-lg font-black">
            <ShieldCheck size={22} className="text-gold" />
            M&B CELULARES
          </div>
          <p className="max-w-md text-sm leading-6 text-white/70">
            Celulares novos e seminovos selecionados, com garantia, atendimento
            rápido e compra finalizada direto pelo WhatsApp.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white/60">
            Atendimento
          </h3>
          <div className="space-y-2 text-sm text-white/75">
            <p>SEGUNDA A DOMINGO</p>
            <p>Entrega em toda a região</p>
            <p>Parcelamento em até 12x</p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white/60">
            Contato
          </h3>
          <div className="flex gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-white/10">
              <MessageCircle size={18} />
            </span>
            <span className="grid h-10 w-10 place-items-center rounded-md bg-white/10">
              <Instagram size={18} />
            </span>
            <span className="grid h-10 w-10 place-items-center rounded-md bg-white/10">
              <Mail size={18} />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
