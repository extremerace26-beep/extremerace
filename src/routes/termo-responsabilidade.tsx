import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/termo-responsabilidade")({
  head: () => ({
    meta: [
      { title: "Termo de Responsabilidade — Extreme Race" },
      { name: "description", content: "Leia o termo de responsabilidade para participar da Extreme Race." },
    ],
  }),
  component: TermoResponsabilidadePage,
});

function TermoResponsabilidadePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/95 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center">
            <img src={logo} alt="Extreme Race" className="h-14 md:h-16 object-contain" />
          </Link>
          <Link to="/inscricao" className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground">
            ← Voltar
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 md:py-20">
        <span className="text-brand font-mono text-xs tracking-[0.3em] uppercase">Termo de Responsabilidade</span>
        <h1 className="font-display text-5xl md:text-6xl font-black uppercase tracking-tighter mt-4 mb-8">
          Termo de Responsabilidade
        </h1>

        <div className="space-y-8 text-sm text-foreground/90 leading-relaxed">
          <section>
            <p>Eu, participante da Extreme Race, declaro que estou ciente dos riscos inerentes à prática de atividade esportiva em percurso com obstáculos, e assumo inteira responsabilidade por eventuais danos materiais, físicos ou morais decorrentes da minha participação.</p>
          </section>

          <section>
            <p>Declaro que estou em condições físicas e mentais adequadas para participar do evento. Caso possua alguma condição de saúde que exija atenção especial, comprometome a informar à organização antes da prova e a seguir as orientações médicas recomendadas.</p>
          </section>

          <section>
            <p>Estou ciente de que a organização poderá desclassificar ou suspender a minha participação em caso de conduta antidesportiva, uso de substâncias proibidas, comportamento perigoso ou desrespeito às normas do evento.</p>
          </section>

          <section>
            <p>Autorizo o uso de minha imagem capturada durante o evento para fins institucionais e de divulgação da Extreme Race, sem qualquer ônus para a organização.</p>
          </section>

          <section>
            <p>Em caso de emergência, autorizo a organização a tomar medidas necessárias, incluindo atendimento médico de urgência e remoção para unidade de saúde, se for o caso.</p>
          </section>

          <section>
            <p>Declaro também que li e concordo com o regulamento do evento, e que todas as informações fornecidas no momento da inscrição são verdadeiras e precisas.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
