import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { CHECKOUT_LINKS } from "@/lib/checkout-links";
import heroImage from "@/assets/hero-race.jpg";
import obstacleQuebraPeito from "@/assets/obstacle-quebra-peito.jpg";
import obstacleFire from "@/assets/obstacle-fire.jpg";
import obstacleMacaquinho from "@/assets/obstacle-macaquinho.jpg";
import obstacleRastejoSangrento from "@/assets/obstacle-rastejo-sangrento.jpg";
import obstacleParedeContencao from "@/assets/obstacle-parede-contencao.jpg";
import obstacleParedeChoro from "@/assets/obstacle-parede-choro.jpg";
import obstacleParedePneus from "@/assets/obstacle-parede-pneus.jpg";

export const Route = createFileRoute("/")({
  component: ExtremeRace,
});

const obstacles = [
  {
    name: "Obstáculo Macaquinho",
    description: "Um desafio rápido e traiçoeiro que exige força e equilíbrio.",
    image: obstacleMacaquinho,
  },
  {
    name: "Rastejo Sangrento",
    description: "Rastejo extremo sob arame e lama, só para os mais resistentes.",
    image: obstacleRastejoSangrento,
  },
  {
    name: "Parede de Contenção",
    description: "Uma barreira alta que testa sua técnica e explosão.",
    image: obstacleParedeContencao,
  },
  {
    name: "Parede do Choro",
    description: "Subida brutal onde poucos conseguem manter o ritmo.",
    image: obstacleParedeChoro,
  },
  {
    name: "Parede de Pneus",
    description: "Navegue entre pneus soltos enquanto busca o topo.",
    image: obstacleParedePneus,
  },
  {
    name: "Quebra Peito",
    description: "A prova final que testa sua força máxima antes da meta.",
    image: obstacleQuebraPeito,
  },
];

const schedule = [
  { time: "18 e 19 de setembro", title: "Entrega de Kits", desc: "Entrega de kits dia 18 e 19 de setembro" },
  { time: "05:00h", title: "Abertura da Arena", desc: "Manhã" },
  { time: "06:00", title: "Largada Elite", desc: "" },
  { time: "10 em 10 minutos", title: "Demais categorias", desc: "Demais categorias de 10 em 10 minutos" },
];

const faqs = [
  {
    q: "Como funciona a Extreme Race?",
    a: "São 5KM de percurso com 30 obstáculos espalhados pela rota. Você escolhe a categoria, larga em onda e tem que cruzar a linha de chegada — não importa como.",
  },
  {
    q: "Posso trocar a titularidade da inscrição?",
    a: "Sim. A troca de titularidade pode ser solicitada até 7 dias antes do evento, mediante taxa administrativa via área do atleta.",
  },
  {
    q: "Como retiro meu kit?",
    a: "A retirada acontece na véspera do evento das 10h às 20h em local divulgado por e-mail, ou no dia da prova mediante apresentação de documento.",
  },
  {
    q: "Tem reembolso se eu desistir?",
    a: "Não haverá reembolso de valores; os atletas podem vender ou transferir a inscrição para outra pessoa.",
  },
  {
    q: "Como funciona o check-in no dia?",
    a: "Apresente seu número de peito e documento na entrada. O guarda-volumes funciona até o fim da última bateria.",
  },
  {
    q: "Preciso de experiência prévia?",
    a: "Para a Open, não. Para a Elite, recomendamos histórico de treino funcional ou corrida de obstáculos.",
  },
];

function ExtremeRace() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="inline-flex items-center">
            <img src={logo} alt="Extreme Race" className="h-14 md:h-16 object-contain" />
          </a>
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            <a href="#desafio" className="hover:text-brand transition-colors">Obstáculos</a>
            <a href="#categorias" className="hover:text-brand transition-colors">Inscrição</a>
            <a href="#cronograma" className="hover:text-brand transition-colors">Cronograma</a>
            <a href="#faq" className="hover:text-brand transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="hidden sm:inline-block text-xs font-bold px-4 py-2.5 hover:text-brand transition-all uppercase tracking-widest text-muted-foreground"
            >
              Entrar
            </Link>
            <a
              href="#categorias"
              className="bg-brand text-brand-foreground text-xs font-bold px-5 py-2.5 hover:brightness-110 transition-all uppercase tracking-widest"
            >
              Inscrição
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section id="top" className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        <img
          src={heroImage}
          alt="Atleta escalando muro coberto de lama na Extreme Race"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex flex-col items-center gap-3 mb-8 border border-border bg-background/60 backdrop-blur px-4 py-2">
            <span className="size-2 bg-brand animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              20 - setembro - 2026 - Piripiri-PI
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Parque de Exposição Carolina Freitas Lira
            </span>
          </div>

          <h1 className="font-display text-6xl sm:text-7xl md:text-9xl font-black uppercase leading-[0.85] tracking-tighter text-balance max-w-[18ch] mx-auto">
            O Desafio mais brutal do <span className="text-brand italic">Piauí</span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-muted-foreground font-medium text-pretty max-w-[44ch] mx-auto">
            Corra. Escale. Arraste. Supere. Uma experiência extrema que vai testar cada fibra do seu corpo e da sua mente.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#categorias"
              className="bg-brand text-brand-foreground px-10 py-5 text-base font-black uppercase tracking-widest hover:brightness-110 transition-all"
            >
              Fazer Inscrição
            </a>
            <a
              href="#desafio"
              className="bg-transparent border border-border text-foreground px-10 py-5 text-base font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
            >
              Ver Percurso
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground/60">
          scroll ↓
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 md:py-28 border-y border-border bg-surface/30">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
          {[
            { value: "5KM", label: "Percurso", brand: true },
            { value: "30", label: "Obstáculos" },
            { value: "1K+", label: "Atletas" },
            { value: "01", label: "Missão", brand: true },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <span
                className={`font-display text-7xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tighter ${
                  stat.brand ? "text-brand" : "text-foreground"
                }`}
              >
                {stat.value}
              </span>
              <span className="text-[11px] uppercase tracking-[0.3em] font-semibold text-muted-foreground mt-3">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* OBSTACLES */}
      <section id="desafio" className="py-24 md:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <div>
              <span className="text-brand font-mono text-xs tracking-[0.3em] uppercase">[ Section_02 ]</span>
              <h2 className="font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter mt-3">
                O Desafio
              </h2>
              <p className="mt-4 text-muted-foreground max-w-md">
                Trinta obstáculos de dor, técnica e coragem. Aqui está uma amostra do que te espera.
              </p>
            </div>
            <a
              href="#categorias"
              className="self-start md:self-auto text-xs font-bold uppercase tracking-widest text-brand border-b-2 border-brand pb-1 hover:brightness-110"
            >
              Quero encarar →
            </a>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {obstacles.map((obs, idx) => (
              <div
                key={obs.name}
                className="group relative overflow-hidden border border-border bg-surface aspect-[4/5]"
              >
                <img
                  src={obs.image}
                  alt={obs.name}
                  width={800}
                  height={1000}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute top-6 left-6 font-mono text-xs text-brand tracking-widest">
                  0{idx + 1} / 30
                </div>
                <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col">
                  <h3 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight">
                    {obs.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 max-h-0 group-hover:max-h-32 opacity-0 group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                    {obs.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categorias" className="py-24 md:py-32 bg-[#0A0A0A] border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-brand font-mono text-xs tracking-[0.3em] uppercase block mb-3">
              INSCRIÇÕES ABERTAS
            </span>
            <div className="flex items-center justify-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-12 h-[2px] bg-brand" />
                <svg className="w-4 h-4 text-brand rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <h2 className="font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter text-white">
                ESCOLHA SUA INSCRIÇÃO
              </h2>
              <div className="hidden sm:flex items-center gap-2">
                <svg className="w-4 h-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <div className="w-12 h-[2px] bg-brand" />
              </div>
            </div>
            <p className="mt-4 text-muted-foreground text-sm max-w-xl mx-auto">
              Selecione a modalidade que melhor atende você.
            </p>
          </div>

          {/* Banner / Faixa Informativa */}
          <div className="max-w-3xl mx-auto mb-16 border border-brand/50 bg-[#0A0A0A] rounded-xl p-4 flex items-center justify-center gap-4 text-center">
            <div className="bg-brand/10 p-2.5 rounded-lg shrink-0 hidden sm:block">
              <svg className="w-6 h-6 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="text-sm">
              <p className="font-bold text-white leading-snug">
                Garanta sua vaga antes da próxima virada de lote.
              </p>
              <p className="text-brand font-medium mt-0.5 leading-snug">
                Os valores aumentam conforme o cronograma do evento.
              </p>
            </div>
          </div>

          {/* Grid of 4 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* Card 1: Individual */}
            <div className="relative p-8 border border-brand bg-[#0A0A0A] rounded-xl flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_0_20px_rgba(102,243,102,0.15)]">
              <div className="text-brand mb-6 shrink-0">
                <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              
              <h3 className="font-display text-3xl font-black uppercase leading-tight tracking-wide mb-4">
                INSCRIÇÃO<br />
                <span className="text-brand">INDIVIDUAL</span>
              </h3>

              <div className="mb-6 flex flex-col items-center">
                <span className="font-display text-5xl font-black text-white">R$ 129,90</span>
                <span className="text-brand text-xs font-semibold uppercase tracking-wider mt-1">
                  Lote até 30/07/2026
                </span>
              </div>

              <ul className="space-y-3 mb-8 w-full text-left flex-grow">
                <li className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <span className="text-brand shrink-0 mt-0.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Cronometragem com chip</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <span className="text-brand shrink-0 mt-0.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Camiseta oficial</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <span className="text-brand shrink-0 mt-0.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Medalha Finisher</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <span className="text-brand shrink-0 mt-0.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Seguro do atleta</span>
                </li>
              </ul>

              <Link
                to="/inscricao"
                search={{ modalidade: "individual" }}
                className="w-full py-4 bg-brand text-brand-foreground text-sm font-black uppercase tracking-widest hover:brightness-110 hover:shadow-[0_0_15px_rgba(102,243,102,0.4)] transition-all text-center rounded-lg shrink-0"
              >
                Inscrever-se
              </Link>
            </div>

            {/* Card 2: Desconto para Grupos */}
            <div className="relative p-8 border border-brand bg-[#0A0A0A] rounded-xl flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_0_20px_rgba(102,243,102,0.15)]">
              <div className="text-brand mb-6 shrink-0">
                <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 18a3 3 0 0 1 3-3h1" />
                  <circle cx="6" cy="9" r="2.5" />
                  <path d="M16 15h1a3 3 0 0 1 3 3" />
                  <circle cx="18" cy="9" r="2.5" />
                  <path d="M12 21v-2a4 4 0 0 0-4-4h8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="8" r="3.5" />
                </svg>
              </div>

              <h3 className="font-display text-3xl font-black uppercase leading-tight tracking-wide mb-4">
                DESCONTO PARA<br />
                <span className="text-brand">GRUPOS</span>
              </h3>

              <div className="mb-6 flex flex-col items-center">
                <span className="font-display text-5xl font-black text-white">R$ 119,90</span>
                <span className="text-brand text-xs font-semibold uppercase tracking-wider mt-1">
                  por atleta
                </span>
              </div>

              <ul className="space-y-3 mb-8 w-full text-left flex-grow">
                <li className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <span className="text-brand shrink-0 mt-0.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Mais de 10 atletas</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <span className="text-brand shrink-0 mt-0.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Pré-cadastro obrigatório</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <span className="text-brand shrink-0 mt-0.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Atendimento via WhatsApp</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <span className="text-brand shrink-0 mt-0.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Valor promocional</span>
                </li>
              </ul>

              <Link
                to="/inscricao"
                search={{ modalidade: "grupo" }}
                className="w-full py-4 bg-brand text-brand-foreground text-sm font-black uppercase tracking-widest hover:brightness-110 hover:shadow-[0_0_15px_rgba(102,243,102,0.4)] transition-all text-center rounded-lg shrink-0 flex items-center justify-center gap-2"
              >
                <span>Inscrever-se</span>
              </Link>
            </div>

            {/* Card 3: Dupla */}
            <div className="relative p-8 border border-brand bg-[#0A0A0A] rounded-xl flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_0_20px_rgba(102,243,102,0.15)]">
              <div className="text-brand mb-6 shrink-0">
                <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="10" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <circle cx="19" cy="9" r="3" />
                </svg>
              </div>

              <h3 className="font-display text-3xl font-black uppercase leading-tight tracking-wide mb-4">
                INSCRIÇÃO EM<br />
                <span className="text-brand">DUPLA</span>
              </h3>

              <div className="mb-6 flex flex-col items-center">
                <span className="font-display text-5xl font-black text-white">R$ 239,98</span>
                <span className="text-brand text-xs font-semibold uppercase tracking-wider mt-1">
                  valor referente à dupla
                </span>
              </div>

              <ul className="space-y-3 mb-8 w-full text-left flex-grow">
                <li className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <span className="text-brand shrink-0 mt-0.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Categoria Open</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <span className="text-brand shrink-0 mt-0.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Dupla masculina, feminina ou mista</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <span className="text-brand shrink-0 mt-0.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Valor referente à dupla</span>
                </li>
              </ul>

              <Link
                to="/inscricao"
                search={{ modalidade: "dupla" }}
                className="w-full py-4 bg-brand text-brand-foreground text-sm font-black uppercase tracking-widest hover:brightness-110 hover:shadow-[0_0_15px_rgba(102,243,102,0.4)] transition-all text-center rounded-lg shrink-0"
              >
                Inscrever dupla
              </Link>
            </div>

            {/* Card 4: Econômica */}
            <div className="relative p-8 border border-brand bg-[#0A0A0A] rounded-xl flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_0_20px_rgba(102,243,102,0.15)]">
              <div className="relative mb-6 shrink-0">
                <svg className="w-14 h-14 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 18V9h12v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z" />
                  <path d="M6 9H3V5h3l3 2 3-2 3 2 3-2h3v4h-3v9" />
                </svg>
                <div className="absolute -bottom-1 -right-1 bg-[#0A0A0A] rounded-full p-0.5">
                  <svg className="w-5 h-5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                </div>
              </div>

              <h3 className="font-display text-3xl font-black uppercase leading-tight tracking-wide mb-4">
                INSCRIÇÃO<br />
                <span className="text-brand">ECONÔMICA</span>
              </h3>

              <div className="mb-6 flex flex-col items-center">
                <span className="font-display text-5xl font-black text-white">R$ 90,00</span>
                <span className="text-brand text-xs font-semibold uppercase tracking-wider mt-1">
                  Lote até 11/07/2026
                </span>
              </div>

              <ul className="space-y-3 mb-8 w-full text-left flex-grow">
                <li className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <span className="text-brand shrink-0 mt-0.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Sem camiseta oficial</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <span className="text-brand shrink-0 mt-0.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Mais de 20 atletas</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <span className="text-brand shrink-0 mt-0.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>Ideal para grupos e assessorias</span>
                </li>
              </ul>

              <Link
                to="/inscricao"
                search={{ modalidade: "economica" }}
                className="w-full py-4 bg-brand text-brand-foreground text-sm font-black uppercase tracking-widest hover:brightness-110 hover:shadow-[0_0_15px_rgba(102,243,102,0.4)] transition-all text-center rounded-lg shrink-0"
              >
                Inscrever-se
              </Link>
            </div>
          </div>

          {/* Footer Strip */}
          <div className="mt-16 border border-border bg-[#0A0A0A] rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="flex items-center gap-4 justify-center md:justify-start px-4 py-3 md:py-0">
              <div className="bg-brand/10 p-3 rounded-full text-brand shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 11 11 13 15 9" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-brand">Inscrição Segura</h4>
                <p className="text-muted-foreground text-xs mt-0.5">Ambiente 100% seguro e verificado</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start px-4 md:pl-8 py-3 md:py-0">
              <div className="bg-brand/10 p-3 rounded-full text-brand shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-brand">Pagamento Protegido</h4>
                <p className="text-muted-foreground text-xs mt-0.5">Seus dados sempre protegidos</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start px-4 md:pl-8 py-3 md:py-0">
              <div className="bg-brand/10 p-3 rounded-full text-brand shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                  <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-brand">Evento Oficial</h4>
                <p className="text-muted-foreground text-xs mt-0.5">Extreme Race V - Competitivo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KIT */}
      <section className="py-24 md:py-32 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-brand font-mono text-xs tracking-[0.3em] uppercase">[ Section_04 ]</span>
            <h2 className="font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter mt-3">
              O kit do <span className="text-brand italic">guerreiro</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md">
              Você sai da arena com a prova permanente de que cruzou a linha.
            </p>

            <div className="mt-12 space-y-1">
              {[
                ["01", "Camiseta Dry-Fit Premium", "Tecido técnico, modelagem atlética."],
                ["02", "Medalha em Metal Pesado", "Forjada para durar uma vida."],
                ["03", "Chip de Cronometragem", "Acompanhe sua performance em tempo real."],
                ["04", "Número de Peito", "Sua identidade na corrida."],
                ["05", "Brindes dos Patrocinadores", "Surpresas dentro do kit."],
              ].map(([num, title, desc]) => (
                <div
                  key={num}
                  className="flex items-center gap-6 p-5 border-l-2 border-brand bg-surface/40 hover:bg-surface transition-colors"
                >
                  <span className="font-display text-3xl font-black text-muted-foreground/60">
                    {num}
                  </span>
                  <div>
                    <div className="font-bold uppercase tracking-tight text-sm">{title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square bg-surface border border-border relative overflow-hidden">
              <img
                src={obstacleFire}
                alt="Kit Extreme Race"
                width={1000}
                height={1000}
                loading="lazy"
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-background via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 font-display text-4xl font-black uppercase italic">
                Kit<br />Completo
              </div>
            </div>
            <div className="absolute -top-6 -right-6 bg-brand text-brand-foreground size-32 grid place-items-center font-display text-xl font-black uppercase -rotate-12 text-center leading-none p-4">
              Exclusivo Finisher
            </div>
          </div>
        </div>
      </section>

      {/* SCHEDULE */}
      <section id="cronograma" className="py-24 md:py-32 bg-surface/40 border-y border-border">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-brand font-mono text-xs tracking-[0.3em] uppercase">[ Section_05 ]</span>
            <h2 className="font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter mt-3">
              Cronograma
            </h2>
          </div>

          <div className="relative space-y-10">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
            {schedule.map((s, i) => (
              <div key={s.time} className="relative pl-14">
                <div
                  className={`absolute left-2 top-1 size-4 rotate-45 ${
                    i === 0 || i === schedule.length - 1 ? "bg-brand" : "bg-muted-foreground/40"
                  }`}
                />
                <span className="text-brand font-mono text-sm font-bold">{s.time}</span>
                <h4 className="text-xl font-bold uppercase tracking-tight mt-1">{s.title}</h4>
                <p className="text-muted-foreground text-sm mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 md:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <span className="text-brand font-mono text-xs tracking-[0.3em] uppercase">[ Section_06 ]</span>
            <h2 className="font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter mt-3">
              Quem cruzou a <span className="text-brand italic">linha</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Participar do Extreme Race foi uma das maiores loucuras que já fiz… é sobre se sentir vivo e vencer, principalmente sua mente!",
                name: "ANA CRISTINA",
                role: "Participante",
              },
              {
                quote: "Depois de ir uma vez sempre vai querer ir de novo.",
                name: "MARGARETHE SOUSA",
                role: "Participante",
              },
              {
                quote: "Uma prova sensacional! Desafio de seus limites físicos e emocionais! adrenalina a mil e diversão garantida.",
                name: "CHAGAS MELO",
                role: "Participante",
              },
              {
                quote: "Essa não vai ser a única vez que vai querer ir. Mas vá com força e foco total! É um espetáculo.",
                name: "MADALENA GOMES",
                role: "Participante",
              },
              {
                quote: "É uma experiência incrível. Quem vai a primeira vez nunca esquece.",
                name: "SKARLEY BONIFACIO",
                role: "Participante",
              },
              {
                quote: "A linha de chegada desta prova é diferente, melhor experiência.",
                name: "BIANCA MILLE",
                role: "Participante",
              },
              {
                quote: "Tem que ser louco pelo menos uma vez na vida e viver essa experiência.",
                name: "VANESSA FERRO",
                role: "Participante",
              },
            ].map((t) => (
              <div key={t.name} className="border border-border p-8 bg-surface/30 flex flex-col">
                <div className="text-brand font-display text-6xl font-black leading-none mb-4">"</div>
                <p className="text-foreground/90 flex-grow leading-relaxed">{t.quote}</p>
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="font-bold uppercase tracking-tight">{t.name}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                    {t.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 md:py-32 bg-surface/40 border-y border-border">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-16">
            <span className="text-brand font-mono text-xs tracking-[0.3em] uppercase">[ Section_07 ]</span>
            <h2 className="font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter mt-3">
              FAQ
            </h2>
          </div>

          <div className="divide-y divide-border border-y border-border">
            {faqs.map((faq, i) => (
              <button
                key={faq.q}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left py-6 group"
              >
                <div className="flex items-center justify-between gap-6">
                  <span className="font-display text-xl md:text-2xl font-bold uppercase tracking-tight group-hover:text-brand transition-colors">
                    {faq.q}
                  </span>
                  <span
                    className={`text-brand text-2xl font-black shrink-0 transition-transform ${
                      openFaq === i ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </div>
                <div
                  className={`grid transition-all duration-300 ${
                    openFaq === i ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-muted-foreground leading-relaxed pr-12">{faq.a}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 md:py-40 bg-brand text-brand-foreground text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src={heroImage}
            alt=""
            width={1920}
            height={1080}
            loading="lazy"
            className="w-full h-full object-cover mix-blend-multiply"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] mb-6 opacity-80">
            últimas vagas — Lote 1
          </p>
          <h2 className="font-display text-6xl md:text-8xl lg:text-9xl font-black uppercase leading-[0.85] tracking-tighter mb-12 text-balance">
            Não espere<br />estar pronto.
          </h2>
          <Link
            to="/inscricao"
            className="inline-block bg-background text-foreground px-12 py-6 text-lg md:text-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Garantir minha vaga
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-background border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="font-display text-2xl font-black uppercase">
            Extreme<span className="text-brand">Race</span>
          </span>
          <p className="text-muted-foreground text-[11px] tracking-widest uppercase">
            © 2026 Extreme Race. Supere-se.
          </p>
          <div className="flex gap-6 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            <a href="#" className="hover:text-brand transition-colors">Instagram</a>
            <a href="#" className="hover:text-brand transition-colors">YouTube</a>
            <a href="/regulamento.pdf" download target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors">Regulamento</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
