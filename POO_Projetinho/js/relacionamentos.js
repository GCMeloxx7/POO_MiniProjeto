// ─────────────────────────────────────────────────────────────
// MISSÃO 7 — Agregação (TrilhaEstudo ◇── Disciplina)
// MISSÃO 8 — Composição (PlanoEstudo ◆── ItemCronograma)
//            Dependência (ServicoAlertaResponsavel - - -> ...)
// ─────────────────────────────────────────────────────────────
class TrilhaEstudo {
  #titulo;
  #administrador;   // associação
  #disciplinas = []; // agregação: as disciplinas nascem FORA da trilha

  constructor(titulo, administrador) {
    this.#titulo = titulo;
    this.#administrador = administrador;
  }

  getTitulo() { return this.#titulo; }
  getAdministrador() { return this.#administrador; }
  getDisciplinas() { return [...this.#disciplinas]; }

  adicionarDisciplina(disciplina) {
    if (this.#disciplinas.includes(disciplina)) return false;
    this.#disciplinas.push(disciplina);
    return true;
  }

  calcularCargaHorariaTotal() {
    return this.#disciplinas.reduce((soma, d) => soma + d.getCargaHorariaSemanalHoras(), 0);
  }
}

class ItemCronograma {
  #diaSemana;
  #minutosPlanejados;

  constructor(diaSemana, minutosPlanejados) {
    this.#diaSemana = diaSemana;
    this.#minutosPlanejados = minutosPlanejados;
  }

  getDiaSemana() { return this.#diaSemana; }
  getMinutosPlanejados() { return this.#minutosPlanejados; }
}

class PlanoEstudo {
  #itens = []; // composição: os itens nascem e morrem AQUI DENTRO

  // Recebe dados primitivos e faz o "new" lá dentro
  adicionarItem(diaSemana, minutos) {
    if (!(minutos > 0)) return false;
    this.#itens.push(new ItemCronograma(diaSemana, minutos));
    return true;
  }

  // Devolve objetos simples (cópias), nunca a lista nem os ItemCronograma reais
  listarItens() {
    return this.#itens.map(i => ({
      diaSemana: i.getDiaSemana(),
      minutosPlanejados: i.getMinutosPlanejados()
    }));
  }

  calcularMinutosTotais() {
    return this.#itens.reduce((soma, i) => soma + i.getMinutosPlanejados(), 0);
  }
}

// Sem campos: só USA os objetos durante a chamada (dependência)
class ServicoAlertaResponsavel {
  avaliarDiscente(discente, meta, responsavel, notificador) {
    verificarNotificador(notificador);
    const pct = meta.calcularPercentual();
    const mensagem = meta.estaCumprida()
      ? `Parabéns! ${discente.getNome()} bateu a meta semanal (100%).`
      : `${discente.getNome()} está com ${pct.toFixed(0)}% da meta semanal.`;
    return notificador.enviarAlerta(responsavel.getEmail(), mensagem);
  }
}
