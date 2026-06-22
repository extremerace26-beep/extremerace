import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import heroImage from "@/assets/hero-race.jpg";
import obstacleRope from "@/assets/obstacle-rope.jpg";
import obstacleMud from "@/assets/obstacle-mud.jpg";
import obstacleWall from "@/assets/obstacle-wall.jpg";
import obstacleCarry from "@/assets/obstacle-carry.jpg";
import obstacleRings from "@/assets/obstacle-rings.jpg";
import obstacleFire from "@/assets/obstacle-fire.jpg";

export const Route = createFileRoute("/")({
  component: ExtremeRace,
});

const obstacles = [
  {
    name: "Muro Vertical",
    description: "Muro inclinado de 4 metros sem apoios laterais. Pura força e técnica.",
    image: obstacleWall,
  },
  {
    name: "Corda Extrema",
    description: "Escalada vertical de 6 metros em corda de sisal molhada. Toque o sino.",
    image: obstacleRope,
  },
  {
    name: "Lama Profunda",
    description: "Rastejo militar de 50m sob arame farpado e lama densa.",
    image: obstacleMud,
  },
  {
    name: "Transporte de Carga",
    description: "Saco de 25kg por 400m em terreno irregular. Coração no limite.",
    image: obstacleCarry,
  },
  {
    name: "Escalada Suspensa",
    description: "Argolas e barras sobre o fosso de água. Falhou, molhou.",
    image: obstacleRings,
  },
  {
    name: "Salto de Fogo",
    description: "A última prova antes da chegada. Voa por cima das chamas.",
    image: obstacleFire,
  },
];

const categories = [
  {
    slug: "elite" as const,
    badge: "Competitivo",
    name: "Elite",
    price: "R$ 249",
    description: "Para atletas que disputam o pódio.",
    features: ["Largada exclusiva às 07:00", "Premiação em dinheiro Top 5", "Cronometragem com chip", "Penalidades rigorosas por obstáculo"],
    highlight: true,
  },
  {
    slug: "open" as const,
    badge: "Superação",
    name: "Open",
    price: "R$ 189",
    description: "Para quem corre contra si mesmo.",
    features: ["Largadas em ondas a partir das 08:00", "Auxílio entre atletas permitido", "Medalha finisher garantida", "Foto profissional inclusa"],
    highlight: false,
  },
  {
    slug: "equipes" as const,
    badge: "Comunidade",
    name: "Equipes",
    price: "R$ 159",
    priceSuffix: "/atleta",
    description: "Mínimo 5 pessoas. Box, empresa ou amigos.",
    features: ["Tenda exclusiva da equipe", "Desconto progressivo", "Ranking de equipe", "Kit em lote único"],
    highlight: false,
  },
];

const schedule = [
  { time: "05:30", title: "Entrega de Kits", desc: "Retirada antecipada na arena." },
  { time: "06:00", title: "Abertura da Arena", desc: "Check-in e guarda-volumes liberados." },
  { time: "07:00", title: "Largada Elite", desc: "Atletas competidores no portão de saída." },
  { time: "08:00", title: "Largadas Open", desc: "Baterias a cada 15 minutos." },
  { time: "11:30", title: "Largada Equipes", desc: "Bateria especial para os times." },
  { time: "14:00", title: "Premiação", desc: "Pódio Elite e sorteios entre finishers." },
];

const faqs = [
  {
    q: "Como funciona a Extreme Race?",
    a: "São 8 km de percurso com 25 obstáculos espalhados pela rota. Você escolhe a categoria, larga em onda e tem que cruzar a linha de chegada — não importa como.",
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
    a: "A inscrição pode ser cancelada com reembolso parcial até 30 dias antes do evento. Após esse prazo, é possível transferir a vaga.",
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
          <a href="#top" className="font-display text-2xl font-black tracking-tighter uppercase">
            Extreme<span className="text-brand">Race</span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            <a href="#desafio" className="hover:text-brand transition-colors">Obstáculos</a>
            <a href="#categorias" className="hover:text-brand transition-colors">Categorias</a>
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
            <Link
              to="/inscricao"
              className="bg-brand text-brand-foreground text-xs font-bold px-5 py-2.5 hover:brightness-110 transition-all uppercase tracking-widest"
            >
              Inscrição
            </Link>
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
          <div className="inline-flex items-center gap-3 mb-8 border border-border bg-background/60 backdrop-blur px-4 py-2">
            <span className="size-2 bg-brand animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              24 · Agosto · 2026 — São Paulo
            </span>
          </div>

          <h1 className="font-display text-6xl sm:text-7xl md:text-9xl font-black uppercase leading-[0.85] tracking-tighter text-balance max-w-[18ch] mx-auto">
            Você contra seus <span className="text-brand italic">próprios limites</span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-muted-foreground font-medium text-pretty max-w-[44ch] mx-auto">
            Corra. Escale. Arraste. Supere. Uma experiência extrema que vai testar cada fibra do seu corpo e da sua mente.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/inscricao"
              className="bg-brand text-brand-foreground px-10 py-5 text-base font-black uppercase tracking-widest hover:brightness-110 transition-all"
            >
              Fazer Inscrição
            </Link>
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
            { value: "8KM", label: "Percurso", brand: true },
            { value: "25", label: "Obstáculos" },
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
                Vinte e cinco obstáculos de dor, técnica e coragem. Aqui está uma amostra do que te espera.
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
                  0{idx + 1} / 25
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
      <section id="categorias" className="py-24 md:py-32 bg-surface/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-brand font-mono text-xs tracking-[0.3em] uppercase">[ Section_03 ]</span>
            <h2 className="font-display text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter mt-3">
              Escolha sua <span className="text-brand italic">categoria</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Lote 1 disponível por tempo limitado. Quem se inscreve cedo, larga na frente.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className={`relative p-10 border bg-background flex flex-col ${
                  cat.highlight ? "border-brand md:scale-105" : "border-border"
                }`}
              >
                {cat.highlight && (
                  <div className="absolute -top-3 left-10 bg-brand text-brand-foreground px-3 py-1 text-[10px] font-black tracking-widest uppercase">
                    Mais disputada
                  </div>
                )}
                <span
                  className={`font-mono text-[10px] tracking-[0.3em] uppercase font-bold ${
                    cat.highlight ? "text-brand" : "text-muted-foreground"
                  }`}
                >
                  {cat.badge}
                </span>
                <h3 className="font-display text-5xl md:text-6xl font-black uppercase mt-3 tracking-tight">
                  {cat.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-3">{cat.description}</p>

                <div className="my-8">
                  <span className="font-display text-5xl font-black">{cat.price}</span>
                  {cat.priceSuffix && (
                    <span className="text-muted-foreground text-sm italic">{cat.priceSuffix}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-10 flex-grow">
                  {cat.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <span className="size-1.5 bg-brand mt-2 shrink-0" />
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/inscricao"
                  search={{ categoria: cat.slug }}
                  className={`w-full py-4 text-xs font-black uppercase tracking-widest transition-all text-center ${
                    cat.highlight
                      ? "bg-brand text-brand-foreground hover:brightness-110"
                      : "border border-border text-foreground hover:bg-foreground hover:text-background"
                  }`}
                >
                  Inscrever-se
                </Link>
              </div>
            ))}
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
                quote: "Treinei 6 meses pensando que estava pronto. A Extreme Race me ensinou que sempre dá pra ir mais longe.",
                name: "Rafael M.",
                role: "Finisher Elite 2025",
              },
              {
                quote: "Fui com a galera do box. Saímos com lama nos olhos, medalha no peito e história pra contar pelo ano todo.",
                name: "Juliana S.",
                role: "Capitã de Equipe",
              },
              {
                quote: "Sou corredor de rua, achei que ia ser fácil. Não foi. Foi a coisa mais difícil e a melhor que já fiz.",
                name: "André L.",
                role: "Finisher Open",
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
            <a href="#" className="hover:text-brand transition-colors">Regulamento</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
