// ─────────────────────────────────────────────────────────────
// MISSÃO 4 — Polimorfismo dinâmico (sobrescrita)
// ─────────────────────────────────────────────────────────────
class SessaoEstudo {
  #disciplina;
  #duracaoMinutos;

  constructor(disciplina, duracaoMinutos) {
    if (new.target === SessaoEstudo) {
      throw new Error("SessaoEstudo é abstrata e não pode ser instanciada.");
    }
    if (!(duracaoMinutos > 0)) {
      throw new Error("A duração da sessão deve ser maior que 0.");
    }
    this.#disciplina = disciplina;
    this.#duracaoMinutos = duracaoMinutos;
  }

  getDisciplina() { return this.#disciplina; }
  getDuracaoMinutos() { return this.#duracaoMinutos; }

  // "Métodos abstratos": as filhas são obrigadas a sobrescrever
  obterModalidade() { throw new Error("obterModalidade() deve ser implementado."); }
  calcularXp() { throw new Error("calcularXp() deve ser implementado."); }

  // Método "virtual": comportamento padrão que as filhas podem estender
  gerarFeedback() {
    return `${this.obterModalidade()} em ${this.#disciplina.getNome()} ` +
           `(${this.#duracaoMinutos} min) -> +${this.calcularXp()} XP`;
  }

  // Contrato IExportavelJson (formato esperado por POST /api/sessoes,
  // faltando só o discenteNome, que quem envia acrescenta)
  paraJson() {
    return JSON.stringify({
      disciplina: this.#disciplina.getNome(),
      tipoModalidade: this.obterModalidade(),
      duracaoMinutos: this.#duracaoMinutos,
      xpGanho: this.calcularXp(),
      resumoFeedback: this.gerarFeedback()
    });
  }
}

class SessaoPomodoro extends SessaoEstudo {
  #ciclosCompletos;

  constructor(disciplina, duracaoMinutos, ciclosCompletos) {
    super(disciplina, duracaoMinutos);
    this.#ciclosCompletos = ciclosCompletos >= 0 ? ciclosCompletos : 0;
  }

  getCiclosCompletos() { return this.#ciclosCompletos; }
  obterModalidade() { return "Pomodoro"; }

  calcularXp() {
    return this.getDuracaoMinutos() * 2 + this.#ciclosCompletos * 15;
  }

  gerarFeedback() {
    return super.gerarFeedback() + ` | ${this.#ciclosCompletos} ciclo(s) concluído(s)`;
  }
}

class SessaoExercicios extends SessaoEstudo {
  #totalQuestoes;
  #acertos;

  constructor(disciplina, duracaoMinutos, totalQuestoes, acertos) {
    super(disciplina, duracaoMinutos);
    this.#totalQuestoes = totalQuestoes >= 0 ? totalQuestoes : 0;
    // acertos nunca passa do total de questões
    this.#acertos = Math.min(Math.max(acertos, 0), this.#totalQuestoes);
  }

  getTotalQuestoes() { return this.#totalQuestoes; }
  getAcertos() { return this.#acertos; }
  obterModalidade() { return "Exercicios"; }

  calcularPercentualAcerto() {
    return this.#totalQuestoes > 0 ? (this.#acertos / this.#totalQuestoes) * 100 : 0;
  }

  calcularXp() {
    return this.getDuracaoMinutos() + this.#acertos * 10;
  }

  gerarFeedback() {
    return super.gerarFeedback() +
      ` | ${this.#acertos}/${this.#totalQuestoes} acertos (${this.calcularPercentualAcerto().toFixed(0)}%)`;
  }
}

class SessaoLeitura extends SessaoEstudo {
  #paginasLidas;
  #fezResumo;

  constructor(disciplina, duracaoMinutos, paginasLidas, fezResumo) {
    super(disciplina, duracaoMinutos);
    this.#paginasLidas = paginasLidas >= 0 ? paginasLidas : 0;
    this.#fezResumo = Boolean(fezResumo);
  }

  getPaginasLidas() { return this.#paginasLidas; }
  fezResumo() { return this.#fezResumo; }
  obterModalidade() { return "Leitura"; }

  calcularXp() {
    return this.getDuracaoMinutos() + this.#paginasLidas * 3 + (this.#fezResumo ? 25 : 0);
  }

  gerarFeedback() {
    return super.gerarFeedback() +
      ` | ${this.#paginasLidas} pág.` + (this.#fezResumo ? " + resumo" : "");
  }
}
