import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/regulamento")({
  head: () => ({
    meta: [
      { title: "Regulamento — Extreme Race" },
      { name: "description", content: "Leia o regulamento oficial da Extreme Race." },
    ],
  }),
  component: RegulamentoPage,
});

function RegulamentoPage() {
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
        <span className="text-brand font-mono text-xs tracking-[0.3em] uppercase">Regulamento</span>
        <h1 className="font-display text-5xl md:text-6xl font-black uppercase tracking-tighter mt-4 mb-8">
          Regulamento Oficial
        </h1>

        <div className="space-y-8 text-sm text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-semibold text-xl text-foreground mb-3">1. Disposições Gerais</h2>
            <p>A Extreme Race é uma corrida de obstáculos com percurso de 5km, em que os participantes devem superar desafios físicos e técnicos. A participação implica aceitação total deste regulamento.</p>
          </section>

          <section>
            <h2 className="font-semibold text-xl text-foreground mb-3">2. Inscrição</h2>
            <p>As inscrições devem ser feitas pelo site. O pagamento deve ser realizado no checkout correspondente à modalidade escolhida. Não há devolução de valores após a confirmação do pagamento, exceto nas condições previstas em lei ou neste regulamento.</p>
          </section>

          <section>
            <h2 className="font-semibold text-xl text-foreground mb-3">3. Categorias</h2>
            <p>As categorias são definidas de acordo com a modalidade escolhida. Atletas menores de 18 anos devem apresentar autorização dos responsáveis legais quando exigido.</p>
          </section>

          <section>
            <h2 className="font-semibold text-xl text-foreground mb-3">4. Kit e Camiseta</h2>
            <p>O direito ao kit e à camiseta depende da modalidade escolhida. A modalidade econômica não inclui camiseta. O tamanho selecionado será atendido conforme disponibilidade.</p>
          </section>

          <section>
            <h2 className="font-semibold text-xl text-foreground mb-3">5. Saúde e Segurança</h2>
            <p>O participante declara estar em boas condições físicas e apto a praticar atividade esportiva. É obrigatória a apresentação das informações de emergência para contato em caso de incidentes.</p>
          </section>

          <section>
            <h2 className="font-semibold text-xl text-foreground mb-3">6. Regras de Conduta</h2>
            <p>É proibido praticar atos que coloquem em risco a integridade de outros participantes, público ou equipe técnica. O desrespeito às regras pode resultar em desclassificação.</p>
          </section>

          <section>
            <h2 className="font-semibold text-xl text-foreground mb-3">7. Cancelamento e Alterações</h2>
            <p>A organização se reserva ao direito de alterar cronograma, percurso ou regulamento por motivo de força maior. Em caso de cancelamento do evento, as regras de reembolso serão divulgadas pela organização.</p>
          </section>

          <section>
            <h2 className="font-semibold text-xl text-foreground mb-3">8. Disposições Finais</h2>
            <p>A inscrição implica aceitação de todos os termos deste regulamento. Dúvidas e casos omissos serão resolvidos pela organização, cujo entendimento será soberano.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
