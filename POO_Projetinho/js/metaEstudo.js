class MetaEstudo {
  #metaMinutosSemana;
  #minutosCumpridos = 0; // sempre começa em 0 e só muda via registrarAvanco()

  constructor(metaMinutosSemana) {
    // Reaproveita a validação do próprio método (sem repetir if/else)
    this.redefinirMeta(metaMinutosSemana);
  }

  redefinirMeta(novaMeta) {
    if (!(novaMeta >= 30)) novaMeta = 30;     // menor que 30 (ou inválido) -> 30
    if (novaMeta > 3000) novaMeta = 3000;     // maior que 3000 -> 3000
    this.#metaMinutosSemana = novaMeta;
  }

  registrarAvanco(minutos) {
    if (!(minutos > 0)) return false;   // recusa <= 0 (e NaN)
    if (minutos > 480) return false;    // recusa mais de 8h numa sessão
    this.#minutosCumpridos += minutos;
    return true;
  }

  getMetaMinutosSemana() { return this.#metaMinutosSemana; }
  getMinutosCumpridos() { return this.#minutosCumpridos; }

  calcularPercentual() {
    const pct = (this.#minutosCumpridos / this.#metaMinutosSemana) * 100;
    return Math.min(100, pct); // trava em 100
  }

  estaCumprida() {
    return this.calcularPercentual() >= 100;
  }

  // Contrato IExportavelJson
  paraJson() {
    return JSON.stringify({
      metaMinutosSemana: this.#metaMinutosSemana,
      minutosCumpridos: this.#minutosCumpridos
    });
  }
}
