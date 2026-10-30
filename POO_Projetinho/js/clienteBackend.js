class ClienteBackendEstudo {
  #urlBase;

  constructor(urlBase = "http://localhost:5080") {
    this.#urlBase = urlBase;
  }

  async #requisicao(rota, opcoes) {
    const resposta = await fetch(this.#urlBase + rota, opcoes);
    if (!resposta.ok) {
      throw new Error(`Backend respondeu ${resposta.status} em ${rota}`);
    }
    return resposta.json();
  }

  #post(rota, objeto) {
    return this.#requisicao(rota, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(objeto)
    });
  }

  status() { return this.#requisicao("/api/status"); }
  listarSessoes() { return this.#requisicao("/api/sessoes"); }
  relatorio(nomeDiscente) {
    return this.#requisicao("/api/relatorio/" + encodeURIComponent(nomeDiscente));
  }

  // Usa o contrato IExportavelJson: sessao.paraJson()
  salvarSessao(nomeDiscente, sessao) {
    verificarExportavel(sessao);
    return this.#post("/api/sessoes", {
      discenteNome: nomeDiscente,
      ...JSON.parse(sessao.paraJson())
    });
  }

  salvarMeta(nomeDiscente, nomeResponsavel, metaMinutosSemana) {
    return this.#post("/api/metas", {
      discenteNome: nomeDiscente,
      responsavelNome: nomeResponsavel,
      metaMinutosSemana
    });
  }
}
