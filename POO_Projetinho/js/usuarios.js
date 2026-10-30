class Usuario {
  #id;
  #nome;
  #email;
  #senha; // NUNCA existe getter para a senha

  constructor(id, nome, email, senha) {
    if (new.target === Usuario) {
      throw new Error("Usuario é abstrata e não pode ser instanciada.");
    }
    this.#id = id;
    this.#nome = nome;
    this.#email = email;
    this.#senha = senha;
  }

  getId() { return this.#id; }
  getNome() { return this.#nome; }
  getEmail() { return this.#email; }

  autenticar(senhaDigitada) {
    return senhaDigitada === this.#senha;
  }

  // "Métodos abstratos"
  obterTipoPerfil() { throw new Error("obterTipoPerfil() deve ser implementado."); }
  gerarPainelResumo() { throw new Error("gerarPainelResumo() deve ser implementado."); }
}

class Administrador extends Usuario {
  #cargo;

  constructor(id, nome, email, senha, cargo) {
    super(id, nome, email, senha);
    this.#cargo = cargo;
  }

  getCargo() { return this.#cargo; }
  obterTipoPerfil() { return "Administrador"; }
  gerarPainelResumo() {
    return `Administrador ${this.getNome()} — ${this.#cargo}`;
  }
}

class Responsavel extends Usuario {
  #parentesco;
  #discentes = [];       // Associação: Responsavel ——> Discente
  #metas = new Map();    // id do discente -> MetaEstudo

  constructor(id, nome, email, senha, parentesco) {
    super(id, nome, email, senha);
    this.#parentesco = parentesco;
  }

  getParentesco() { return this.#parentesco; }
  obterTipoPerfil() { return "Responsável"; }

  // Recebe um Discente criado FORA (associação) e não duplica
  vincularDiscente(discente) {
    if (this.#discentes.includes(discente)) return false;
    this.#discentes.push(discente);
    return true;
  }

  getDiscentes() { return [...this.#discentes]; } // cópia: protege a lista

  definirMeta(discente, meta) {
    this.#metas.set(discente.getId(), meta);
  }

  getMeta(discente) {
    return this.#metas.get(discente.getId()) ?? null;
  }

  gerarPainelResumo() {
    return `Responsável ${this.getNome()} (${this.#parentesco}) — ` +
           `acompanhando ${this.#discentes.length} discente(s)`;
  }
}

class Discente extends Usuario {
  #ra;
  #xpTotal = 0;
  #historico = []; // Missão 5

  constructor(id, nome, email, senha, ra) {
    super(id, nome, email, senha);
    this.#ra = ra;
  }

  getRa() { return this.#ra; }
  getXpTotal() { return this.#xpTotal; }
  getHistorico() { return [...this.#historico]; }
  obterTipoPerfil() { return "Discente"; }

  adicionarXp(pontos) {
    if (pontos > 0) this.#xpTotal += pontos;
  }

  gerarPainelResumo() {
    return `Discente ${this.getNome()} | RA ${this.#ra} | XP: ${this.#xpTotal}`;
  }

  // ── Sobrecarga simulada (JS só permite UM método com esse nome) ──
  //  Forma 1: registrarEstudo(sessao)
  //  Forma 2: registrarEstudo(disciplina, minutos)
  //  Forma 3: registrarEstudo(disciplina, horaInicio, horaFim, paginasLidas)
  registrarEstudo(arg1, arg2, arg3, arg4) {
    // Forma 1 — sessão pronta
    if (arg1 instanceof SessaoEstudo) {
      this.#historico.push(arg1);
      this.adicionarXp(arg1.calcularXp());
      return arg1;
    }

    // Forma 2 — atalho rápido (disciplina + minutos)
    if (arg1 instanceof Disciplina && arg3 === undefined) {
      const ciclos = Math.max(1, Math.floor(arg2 / 25));
      return this.registrarEstudo(new SessaoPomodoro(arg1, arg2, ciclos));
    }

    // Forma 3 — por horário (disciplina, horaInicio, horaFim, paginasLidas)
    if (arg1 instanceof Disciplina && arg4 !== undefined) {
      const minutos = (arg3 - arg2) * 60;
      return this.registrarEstudo(new SessaoLeitura(arg1, minutos, arg4, true));
    }

    throw new Error("registrarEstudo: combinação de argumentos não suportada.");
  }
}
