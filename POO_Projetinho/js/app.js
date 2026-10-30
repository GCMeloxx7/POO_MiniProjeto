// ─────────────────────────────────────────────────────────────
// MISSÃO 9 e 10 — Tela + integração com o Backend
// Regra de ouro: a tela só LÊ campos, CRIA o objeto certo e deixa
// as classes calcularem XP e percentual. Nenhuma fórmula aqui.
// ─────────────────────────────────────────────────────────────

// ── 1. Monta o domínio (troque pelos dados reais do seu grupo) ──
const disciplinas = [
  new Disciplina("ADS201", "Programação Orientada a Objetos", "Computação", 4),
  new Disciplina("ADS202", "Banco de Dados", "Dados", 4),
  new Disciplina("ADS203", "Estruturas de Dados", "Computação", 3)
];

const admin = new Administrador(1, "Prof. Adriano", "adriano@fecap.br", "admin123", "Coordenação PI");
const responsavel = new Responsavel(2, "Gustavo Melo", "gustavo@email.com", "resp123", "Pai");
const discente = new Discente(3, "Lucas Silva", "lucas@fecap.br", "lucas123", "RA-26028911");
const meta = new MetaEstudo(200);

responsavel.vincularDiscente(discente);
responsavel.definirMeta(discente, meta);

const trilha = new TrilhaEstudo("Trilha 2º Semestre ADS", admin);
disciplinas.forEach(d => trilha.adicionarDisciplina(d));

const plano = new PlanoEstudo();
plano.adicionarItem("Segunda", 60);
plano.adicionarItem("Quarta", 60);
plano.adicionarItem("Sexta", 80);

const servicoAlerta = new ServicoAlertaResponsavel();
const cliente = new ClienteBackendEstudo("http://localhost:5080");

// ── 2. Utilidades de tela ──
const $ = id => document.getElementById(id);

function toast(texto, tipo = "info") {
  const el = document.createElement("div");
  el.className = "toast" + (tipo === "erro" ? " toast-erro" : tipo === "ok" ? " toast-ok" : "");
  el.textContent = texto;
  $("toasts").appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

// Os notificadores recebem "toast" como saída (Interface + polimorfismo)
const notificadores = {
  email: new NotificadorEmail(toast),
  whatsapp: new NotificadorWhatsApp(toast),
  painel: new NotificadorPainel(toast)
};

// ── 3. Desenha o estado atual dos objetos na tela ──
function renderizar() {
  $("painelDiscente").textContent = discente.gerarPainelResumo();
  $("painelResponsavel").textContent = responsavel.gerarPainelResumo();
  $("painelAdmin").textContent = admin.gerarPainelResumo();
  $("infoTrilha").textContent =
    `${trilha.getTitulo()}: ${trilha.getDisciplinas().length} disciplinas, ` +
    `${trilha.calcularCargaHorariaTotal()}h por semana.`;
  $("infoPlano").textContent =
    `Plano da semana: ${plano.calcularMinutosTotais()} min (` +
    plano.listarItens().map(i => `${i.diaSemana} ${i.minutosPlanejados}`).join(", ") + ").";

  const pct = meta.calcularPercentual();
  $("metaPct").textContent = Math.round(pct) + "%";
  $("metaTexto").textContent =
    `${meta.getMinutosCumpridos()} de ${meta.getMetaMinutosSemana()} min` +
    (meta.estaCumprida() ? " · meta cumprida" : "");
  $("barraPreenchida").style.width = pct + "%";
  $("barra").setAttribute("aria-valuenow", String(Math.round(pct)));

  const lista = $("historico");
  lista.replaceChildren();
  const sessoes = discente.getHistorico();
  $("historicoVazio").hidden = sessoes.length > 0;
  // Polimorfismo: um único laço, sem if de tipo
  for (const sessao of sessoes) {
    const li = document.createElement("li");
    li.textContent = sessao.gerarFeedback();
    lista.appendChild(li);
  }
}

// ── 4. Campos extras que mudam conforme a modalidade ──
const camposExtras = {
  Pomodoro:   [{ id: "x1", rotulo: "Ciclos completos", valor: 1 }],
  Exercicios: [{ id: "x1", rotulo: "Total de questões", valor: 10 },
               { id: "x2", rotulo: "Acertos", valor: 8 }],
  Leitura:    [{ id: "x1", rotulo: "Páginas lidas", valor: 10 },
               { id: "x2", rotulo: "Fez resumo?", tipo: "checkbox" }]
};

function desenharExtras() {
  const area = $("extras");
  area.replaceChildren();
  for (const c of camposExtras[$("modalidade").value]) {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.id = c.id;
    if (c.tipo === "checkbox") {
      input.type = "checkbox";
      input.checked = true;
      label.className = "check";
      label.append(input, c.rotulo);
    } else {
      input.type = "number";
      input.min = "0";
      input.value = c.valor;
      label.append(c.rotulo, input);
    }
    area.appendChild(label);
  }
}

// Cria a subclasse certa (aqui só escolhemos QUAL objeto criar)
function criarSessao(modalidade, disciplina, minutos) {
  const x1 = $("x1");
  const x2 = $("x2");
  switch (modalidade) {
    case "Pomodoro":
      return new SessaoPomodoro(disciplina, minutos, Number(x1.value));
    case "Exercicios":
      return new SessaoExercicios(disciplina, minutos, Number(x1.value), Number(x2.value));
    case "Leitura":
      return new SessaoLeitura(disciplina, minutos, Number(x1.value), x2.checked);
    default:
      throw new Error("Modalidade desconhecida.");
  }
}

// ── 5. Eventos ──
async function aoRegistrar(evento) {
  evento.preventDefault();
  try {
    const disciplina = disciplinas[Number($("disciplina").value)];
    const minutos = Number($("duracao").value);
    const sessao = criarSessao($("modalidade").value, disciplina, minutos);

    // O encapsulamento da MetaEstudo decide se os minutos são aceitos
    if (!meta.registrarAvanco(minutos)) {
      toast("Duração inválida: use entre 1 e 480 minutos.", "erro");
      return;
    }
    discente.registrarEstudo(sessao);
    renderizar();
    toast(sessao.gerarFeedback(), "ok");
  } catch (erro) {
    toast(erro.message, "erro");
    return;
  }

  // Persistência: se o backend estiver fora, o estudo continua na memória
  try {
    const sessao = discente.getHistorico().at(-1);
    await cliente.salvarSessao(discente.getNome(), sessao);
    toast("Sessão gravada no servidor.", "ok");
  } catch {
    toast("Backend offline: a sessão ficou só na memória desta página.", "erro");
  }
}

function aoNotificar() {
  const notificador = notificadores[$("canal").value];
  servicoAlerta.avaliarDiscente(discente, meta, responsavel, notificador);
}

async function verificarBackend() {
  const pill = $("btnStatus");
  try {
    await cliente.status();
    pill.textContent = "Backend online";
    pill.className = "pill pill-on";
    return true;
  } catch {
    pill.textContent = "Backend offline (inicie o .bat)";
    pill.className = "pill pill-off";
    return false;
  }
}

async function carregarHistoricoServidor() {
  const ul = $("listaServidor");
  ul.replaceChildren();
  try {
    const dados = await cliente.listarSessoes();
    const itens = Array.isArray(dados) ? dados : (dados.sessoes ?? []);
    if (itens.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Nenhuma sessão gravada ainda. Registre um estudo acima.";
      ul.appendChild(li);
      return;
    }
    for (const item of itens) {
      const li = document.createElement("li");
      const quem = item.discenteNome ? item.discenteNome + ": " : "";
      li.textContent = quem + (item.resumoFeedback ?? JSON.stringify(item));
      ul.appendChild(li);
    }
  } catch {
    toast("Não consegui falar com o backend. Ele está rodando em localhost:5080?", "erro");
  }
}

async function verRelatorio() {
  const pre = $("relatorio");
  try {
    const dados = await cliente.relatorio(discente.getNome());
    pre.textContent = JSON.stringify(dados, null, 2);
    pre.hidden = false;
  } catch {
    toast("Não consegui buscar o relatório. Confira se o backend está rodando.", "erro");
  }
}

// ── 6. Inicialização ──
async function iniciar() {
  disciplinas.forEach((d, i) => {
    const op = document.createElement("option");
    op.value = i;
    op.textContent = d.getNome();
    $("disciplina").appendChild(op);
  });

  $("modalidade").addEventListener("change", desenharExtras);
  $("formSessao").addEventListener("submit", aoRegistrar);
  $("btnNotificar").addEventListener("click", aoNotificar);
  $("btnStatus").addEventListener("click", verificarBackend);
  $("btnHistoricoServidor").addEventListener("click", carregarHistoricoServidor);
  $("btnRelatorio").addEventListener("click", verRelatorio);

  desenharExtras();
  renderizar();

  // Se o backend estiver no ar, cadastra a meta do discente nele
  if (await verificarBackend()) {
    try {
      await cliente.salvarMeta(discente.getNome(), responsavel.getNome(), meta.getMetaMinutosSemana());
    } catch { /* sem meta no servidor, o resto continua funcionando */ }
  }
}

iniciar();
