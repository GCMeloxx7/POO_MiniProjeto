// ─────────────────────────────────────────────────────────────
// MISSÃO 6 — Interfaces (em JS = contrato documentado + Duck Typing)
// ─────────────────────────────────────────────────────────────
//
// INotificador:
//    obterCanal()                         -> string
//    enviarAlerta(destinatario, mensagem) -> boolean
//
// IExportavelJson:
//    paraJson()                           -> string (JSON)

function verificarNotificador(obj) {
  const ok = obj && typeof obj.obterCanal === "function" &&
             typeof obj.enviarAlerta === "function";
  if (!ok) throw new Error("Objeto não cumpre o contrato INotificador.");
  return obj;
}

function verificarExportavel(obj) {
  if (!obj || typeof obj.paraJson !== "function") {
    throw new Error("Objeto não cumpre o contrato IExportavelJson.");
  }
  return obj;
}

// "saida" é quem mostra a mensagem (console por padrão; a tela passa um toast)
class NotificadorEmail {
  #saida;
  constructor(saida = console.log) { this.#saida = saida; }
  obterCanal() { return "E-mail"; }
  enviarAlerta(destinatario, mensagem) {
    this.#saida(`✉ E-mail para ${destinatario}: ${mensagem}`);
    return true;
  }
}

class NotificadorWhatsApp {
  #saida;
  constructor(saida = console.log) { this.#saida = saida; }
  obterCanal() { return "WhatsApp"; }
  enviarAlerta(destinatario, mensagem) {
    this.#saida(`💬 WhatsApp para ${destinatario}: ${mensagem}`);
    return true;
  }
}

class NotificadorPainel {
  #saida;
  constructor(saida = console.log) { this.#saida = saida; }
  obterCanal() { return "Painel"; }
  enviarAlerta(destinatario, mensagem) {
    this.#saida(`🔔 Painel de ${destinatario}: ${mensagem}`);
    return true;
  }
}
