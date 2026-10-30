// ─────────────────────────────────────────────────────────────
// MISSÃO 1 — Abstração, Classes e Objetos
// ─────────────────────────────────────────────────────────────
class Disciplina {
  #codigo;
  #nome;
  #categoria;
  #cargaHorariaSemanalHoras;

  constructor(codigo, nome, categoria, cargaHorariaSemanalHoras) {
    this.#codigo = codigo;
    this.#nome = nome;
    this.#categoria = categoria;
    // Carga <= 0 (ou valor inválido/NaN) vira o padrão 2
    this.#cargaHorariaSemanalHoras = cargaHorariaSemanalHoras > 0 ? cargaHorariaSemanalHoras : 2;
  }

  getCodigo() { return this.#codigo; }
  getNome() { return this.#nome; }
  getCategoria() { return this.#categoria; }
  getCargaHorariaSemanalHoras() { return this.#cargaHorariaSemanalHoras; }

  calcularCargaEmMinutos() {
    return this.#cargaHorariaSemanalHoras * 60;
  }

  exibirResumo() {
    return `[${this.#codigo}] ${this.#nome} (${this.#categoria}) — ` +
           `${this.#cargaHorariaSemanalHoras}h/semana (${this.calcularCargaEmMinutos()} min)`;
  }
}
