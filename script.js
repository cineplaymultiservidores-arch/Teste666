/* MINES V3 - ambiente de teste */

const $ = (s) => document.querySelector(s);

let saldo = 0;
let aposta = 1;
let jogando = false;
let minas = new Set();
let abertas = new Set();
let multiplicador = 1;

const dinheiro = (v) =>
  Number(v).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

function atualizarSaldo() {
  const el = $("#balance");
  if (el) el.textContent = dinheiro(saldo);
}

function atualizarPremio() {
  multiplicador = 1 + abertas.size * 0.24;

  if ($("#bet")) $("#bet").textContent = dinheiro(aposta);
  if ($("#multiplier")) $("#multiplier").textContent = multiplicador.toFixed(2) + "x";
  if ($("#prize")) $("#prize").textContent = dinheiro(aposta * multiplicador);
}

function mensagem(texto) {
  if ($("#message")) $("#message").textContent = texto;
}

/* Toda nova partida recebe um novo sorteio de minas. */
function sortearMinas() {
  minas.clear();

  const quantidade = Number($("#mineCount")?.value || 5);

  while (minas.size < quantidade) {
    minas.add(Math.floor(Math.random() * 25));
  }
}

function criarTabuleiro() {
  const board = $("#board");
  if (!board) return;

  board.innerHTML = "";

  for (let i = 0; i < 25; i++) {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.className = "cell";
    botao.dataset.index = i;
    botao.textContent = "◆";

    botao.addEventListener("click", () => abrirCasa(i, botao));

    board.appendChild(botao);
  }
}

function revelarMinas() {
  document.querySelectorAll(".cell").forEach((botao) => {
    const i = Number(botao.dataset.index);

    if (minas.has(i)) {
      botao.classList.add("open", "mine");
      botao.textContent = "💣";
    }
  });
}

function abrirCasa(i, botao) {
  if (!jogando || abertas.has(i)) return;

  abertas.add(i);

  if (minas.has(i)) {
    botao.classList.add("open", "mine");
    botao.textContent = "💣";

    jogando = false;
    revelarMinas();

    if ($("#cashout")) $("#cashout").disabled = true;

    mensagem("💥 Você encontrou uma mina e perdeu esta rodada.");

    registrarHistorico(false);
    prepararProximaRodada();
    return;
  }

  botao.classList.add("open", "gem");
  botao.textContent = "💎";

  atualizarPremio();

  if ($("#cashout")) $("#cashout").disabled = false;

  mensagem("💎 Diamante encontrado! Continue ou resgate.");
}

function iniciarJogo() {
  if (saldo < aposta) {
    abrirDeposito();
    mensagem("💰 Saldo insuficiente. Faça um depósito de teste.");
    return;
  }

  saldo -= aposta;
  atualizarSaldo();

  jogando = true;
  abertas.clear();

  /* NOVO SORTEIO A CADA PARTIDA */
  sortearMinas();
  criarTabuleiro();
  atualizarPremio();

  if ($("#cashout")) $("#cashout").disabled = true;

  mensagem("🎮 Partida iniciada. Encontre os diamantes e evite as minas.");
}

function resgatar() {
  if (!jogando || abertas.size === 0) return;

  const premio = aposta * multiplicador;

  saldo += premio;
  atualizarSaldo();

  jogando = false;

  if ($("#cashout")) $("#cashout").disabled = true;

  mensagem(`🎉 Resgate de teste: ${dinheiro(premio)}`);

  registrarHistorico(true, premio);
  prepararProximaRodada();
}

function prepararProximaRodada() {
  minas.clear();

  const botao = $("#start");
  if (!botao) return;

  if (saldo >= aposta) {
    botao.textContent = "🔄 JOGAR NOVAMENTE";
    botao.onclick = iniciarJogo;
  } else {
    botao.textContent = "💰 DEPOSITAR PARA JOGAR";
    botao.onclick = abrirDeposito;
  }
}

function registrarHistorico(vitoria, valor = 0) {
  const lista = $("#history");
  if (!lista) return;

  const linha = document.createElement("div");
  linha.className = "row";

  linha.innerHTML = vitoria
    ? `<span>💎 Resgatou</span><strong class="win">+${dinheiro(valor)}</strong>`
    : `<span>💣 Mina encontrada</span><strong class="loss">-${dinheiro(aposta)}</strong>`;

  lista.prepend(linha);
}

function abrirDeposito() {
  const modal = $("#depositModal");
  if (modal) modal.classList.remove("hidden");
}

function fecharDeposito() {
  const modal = $("#depositModal");
  if (modal) modal.classList.add("hidden");
}

/* Depósito SOMENTE SIMULADO. */
function configurarDeposito() {
  $("#openDeposit")?.addEventListener("click", abrirDeposito);
  $("#closeDeposit")?.addEventListener("click", fecharDeposito);

  document.querySelectorAll(".amounts button").forEach((botao) => {
    botao.addEventListener("click", () => {
      const campo = $("#customAmount");
      if (campo) campo.value = botao.dataset.v || botao.dataset.value || "";
    });
  });

  $("#simulate")?.addEventListener("click", () => {
    const valor = Number($("#customAmount")?.value || 0);

    if (valor <= 0) {
      mensagem("Informe um valor válido.");
      return;
    }

    saldo += valor;
    atualizarSaldo();
    fecharDeposito();

    mensagem(`✅ Depósito de TESTE aprovado: ${dinheiro(valor)}`);

    prepararProximaRodada();
  });
}

function configurarControles() {
  $("#minus")?.addEventListener("click", () => {
    aposta = Math.max(0.5, aposta - 0.5);
    atualizarPremio();
  });

  $("#plus")?.addEventListener("click", () => {
    aposta = Math.min(100, aposta + 0.5);
    atualizarPremio();
  });

  $("#mineCount")?.addEventListener("change", () => {
    if (!jogando) atualizarPremio();
  });

  $("#cashout")?.addEventListener("click", resgatar);

  $("#start")?.addEventListener("click", iniciarJogo);
}

document.addEventListener("DOMContentLoaded", () => {
  criarTabuleiro();
  atualizarSaldo();
  atualizarPremio();
  configurarControles();
  configurarDeposito();
  prepararProximaRodada();
});
