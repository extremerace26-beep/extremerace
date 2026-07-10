export const CHECKOUT_LINKS = {
  individual: "https://loja.infinitepay.io/bwg/jcc6942-inscricao-lote-1-extreme-race",
  grupo: "https://loja.infinitepay.io/bwg/dnr1928-extreme-race-v-lote-promocional",
  dupla: "https://loja.infinitepay.io/bwg/vzp3441-inscricao-em-dupla",
  economica: "https://loja.infinitepay.io/bwg/xip1831-inscricao-sem-blusa-economica",
} as const;

export function getCheckoutLinkByCategoryId(categoryId?: string | null) {
  switch (categoryId) {
    case "individual":
      return CHECKOUT_LINKS.individual;
    case "grupo":
      return CHECKOUT_LINKS.grupo;
    case "dupla":
      return CHECKOUT_LINKS.dupla;
    case "economica":
      return CHECKOUT_LINKS.economica;
    case "elitePro":
    case "master":
    case "senior":
    case "senior2":
    case "iniciante":
    case "open":
    case "teens":
    case "superKids":
    case "kids":
    case "pcd":
      return CHECKOUT_LINKS.individual;
    case "intermediario":
      return CHECKOUT_LINKS.grupo;
    case "duplaMasc":
    case "duplaFemi":
    case "mista":
      return CHECKOUT_LINKS.dupla;
    default:
      return null;
  }
}
