// ─────────────────────────────────────────────────────────────
// Testes de mesa das Missões 1 a 8.
// Abra a página, aperte F12 (Console) e digite:   rodarDemo()
// Cada linha mostra ✔ (passou) ou ✘ (falhou).
// ─────────────────────────────────────────────────────────────
function rodarDemo() {
  let falhas = 0;
  const conferir = (descricao, condicao) => {
    if (!condicao) falhas++;
    console.log((condicao ? "✔ " : "✘ ") + descricao);
  };
  const lanca = fn => { try { fn(); return false; } catch { return true; } };

  console.group("Missão 1 — Disciplina");
  const poo = new Disciplina("ADS201", "Programação Orientada a Objetos", "Computação", 4);
  const ruim = new Disciplina("X", "Teste", "Teste", -4);
  conferir("carga em minutos = 240", poo.calcularCargaEmMinutos() === 240);
  conferir("carga -4 vira 2h (120 min)", ruim.calcularCargaEmMinutos() === 120);
  console.log(poo.exibirResumo());
  console.groupEnd();

  console.group("Missão 2 — MetaEstudo");
  const m = new MetaEstudo(100);
  conferir("recusa -20", m.registrarAvanco(-20) === false);
  conferir("recusa 900", m.registrarAvanco(900) === false);
  conferir("minutos continuam 0", m.getMinutosCumpridos() === 0);
  conferir("aceita 60", m.registrarAvanco(60) === true);
  conferir("percentual 60", m.calcularPercentual() === 60);
  m.registrarAvanco(480);
  conferir("percentual trava em 100", m.calcularPercentual() === 100);
  conferir("meta 10 vira 30", new MetaEstudo(10).getMetaMinutosSemana() === 30);
  conferir("meta 9999 vira 3000", new MetaEstudo(9999).getMetaMinutosSemana() === 3000);
  console.groupEnd();

  console.group("Missão 3 — Usuario abstrata");
  conferir("new Usuario() lança erro", lanca(() => new Usuario(1, "a", "b", "c")));
  const lucas = new Discente(1, "Lucas", "l@x.com", "123", "RA-1");
  conferir("autenticar certo", lucas.autenticar("123"));
  conferir("autenticar errado", !lucas.autenticar("999"));
  conferir("não existe getSenha", lucas.getSenha === undefined);
  console.log(lucas.gerarPainelResumo());
  console.groupEnd();

  console.group("Missão 4 — Polimorfismo dinâmico");
  const sessoes = [
    new SessaoPomodoro(poo, 25, 1),
    new SessaoExercicios(poo, 30, 10, 8),
    new SessaoLeitura(poo, 40, 10, true)
  ];
  let xpTotal = 0;
  for (const s of sessoes) { console.log(s.gerarFeedback()); xpTotal += s.calcularXp(); }
  conferir("Pomodoro 25min 1 ciclo = 65 XP", sessoes[0].calcularXp() === 65);
  conferir("Exercícios 30min 8 acertos = 110 XP", sessoes[1].calcularXp() === 110);
  conferir("Leitura 40min 10 pág + resumo = 95 XP", sessoes[2].calcularXp() === 95);
  conferir("XP total = 270", xpTotal === 270);
  console.groupEnd();

  console.group("Missão 5 — Sobrecarga");
  const d = new Discente(2, "Ana", "a@x.com", "1", "RA-2");
  d.registrarEstudo(new SessaoPomodoro(poo, 25, 1));
  conferir("forma 1: +65 XP", d.getXpTotal() === 65);
  d.registrarEstudo(poo, 50);
  conferir("forma 2: Pomodoro de 50 min (2 ciclos = 130 XP)", d.getXpTotal() === 65 + 130);
  d.registrarEstudo(poo, 14, 15, 10);
  conferir("forma 3: leitura de 60 min (60+30+25 = 115 XP)", d.getXpTotal() === 65 + 130 + 115);
  conferir("histórico com 3 sessões", d.getHistorico().length === 3);
  console.groupEnd();

  console.group("Missão 6 — Interfaces");
  const resp = new Responsavel(3, "Carlos", "c@x.com", "1", "Pai");
  const notifs = [new NotificadorEmail(), new NotificadorWhatsApp(), new NotificadorPainel()];
  notifs.forEach(n => conferir(`${n.obterCanal()} cumpre INotificador`, verificarNotificador(n) === n && n.enviarAlerta(resp.getEmail(), "teste") === true));
  conferir("MetaEstudo.paraJson() é JSON válido", JSON.parse(m.paraJson()).metaMinutosSemana === 100);
  conferir("SessaoEstudo.paraJson() é JSON válido", JSON.parse(sessoes[0].paraJson()).xpGanho === 65);
  console.groupEnd();

  console.group("Missão 7 — Associação e agregação");
  conferir("vincular discente", resp.vincularDiscente(d) === true);
  conferir("não duplica", resp.vincularDiscente(d) === false);
  const adm = new Administrador(4, "Marta", "m@x.com", "1", "Coordenação");
  const trilha = new TrilhaEstudo("Trilha ADS", adm);
  const bd = new Disciplina("ADS202", "Banco de Dados", "Dados", 4);
  trilha.adicionarDisciplina(poo);
  trilha.adicionarDisciplina(bd);
  conferir("carga total da trilha = 8h", trilha.calcularCargaHorariaTotal() === 8);
  const outra = new TrilhaEstudo("Outra trilha", adm);
  outra.adicionarDisciplina(poo);
  conferir("mesma disciplina em 2 trilhas (agregação)", outra.getDisciplinas()[0] === trilha.getDisciplinas()[0]);
  console.groupEnd();

  console.group("Missão 8 — Composição e dependência");
  const plano = new PlanoEstudo();
  plano.adicionarItem("Segunda", 60);
  plano.adicionarItem("Quarta", 90);
  conferir("plano soma 150 min", plano.calcularMinutosTotais() === 150);
  plano.listarItens().push({ diaSemana: "Hack", minutosPlanejados: 999 });
  conferir("alterar a cópia não adultera o plano", plano.calcularMinutosTotais() === 150);
  const servico = new ServicoAlertaResponsavel();
  const meta60 = new MetaEstudo(100); meta60.registrarAvanco(60);
  conferir("alerta enviado", servico.avaliarDiscente(d, meta60, resp, new NotificadorEmail()) === true);
  console.groupEnd();

  console.log(falhas === 0 ? "\n✅ Tudo certo!" : `\n❌ ${falhas} verificação(ões) falharam.`);
}
