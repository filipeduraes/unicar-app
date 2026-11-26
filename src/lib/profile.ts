/** Utilitários do perfil simulado — nada aqui depende de backend. */

/**
 * "filipe.duraes@ufvjm.edu.br" -> "Filipe Duraes".
 * O domínio nunca entra no nome; separadores comuns viram espaços e
 * segmentos extras são preservados ("joao.silva.neto" -> "Joao Silva Neto").
 */
export function nameFromEmail(email: string): string {
  const localPart = email.trim().toLowerCase().split("@")[0] ?? "";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function initialsFromName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
