/* ========== 1. ELEMENTOS DO CANVA ========== */
// Por enquanto, usamos símbolos como exemplo.
// Quando você baixar seus PNGs do Canva, coloque-os na pasta assets/
// e escreva o caminho no campo "imagem".
// Exemplo: { simbolo: "⚡", imagem: "assets/raio.png" }
const elementosMagicos = [
  { simbolo: "⚡", imagem: "" },
  { simbolo: "✦", imagem: "" },
  { simbolo: "🦉", imagem: "" },
  { simbolo: "🧹", imagem: "" },
  { simbolo: "✨", imagem: "" },
  { simbolo: "🔑", imagem: "" },
  { simbolo: "✧", imagem: "" },
  { simbolo: "📜", imagem: "" }
];

const fundoMagico = document.querySelector("#fundo-magico");

function criarElementosFlutuantes() {
  const quantidade = 25;

  for (let i = 0; i < quantidade; i++) {
    const modelo = elementosMagicos[i % elementosMagicos.length];
    const elemento = document.createElement("span");
    elemento.className = "elemento-flutuante";

    // Cada símbolo tem posição, tamanho e velocidade próprios.
    elemento.style.setProperty("--posicao", `${Math.random() * 96}%`);
    elemento.style.setProperty("--tamanho", `${18 + Math.random() * 27}px`);
    elemento.style.setProperty("--duracao", `${17 + Math.random() * 18}s`);
    elemento.style.setProperty("--atraso", `${-Math.random() * 35}s`);
    elemento.style.setProperty("--desvio", `${-60 + Math.random() * 120}px`);
    elemento.style.setProperty("--opacidade", `${0.10 + Math.random() * 0.20}`);


    if (modelo.imagem) {
      const imagem = document.createElement("img");
      imagem.src = modelo.imagem;
      imagem.alt = ""; // Decorativo: não precisa ser lido por leitor de tela.
      elemento.appendChild(imagem);
    } else {
      elemento.textContent = modelo.simbolo;
    }

    fundoMagico.appendChild(elemento);
  }
}

/* ========== 2. ABRIR E FECHAR A CARTA ========== */
const inicio = document.querySelector("#inicio");
const leitura = document.querySelector("#leitura");
const botaoAbrir = document.querySelector("#abrir-carta");
const botaoFechar = document.querySelector("#fechar-carta");
const movimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)");


/* ========== MÚSICA DA CARTA ========== */

const musicaCarta = new Audio(
  "assets/song/Ninguém-Explica-Deus.mp3"
);

musicaCarta.preload = "auto";
musicaCarta.loop = true;
musicaCarta.volume = 0.3;


let estado = "fechada";



function abrirCarta() {
  if (estado !== "fechada") return;

  musicaCarta.currentTime = 0;
  musicaCarta.volume = 0;

  musicaCarta.play().catch((erro) => {
    console.warn("Não foi possível iniciar a música:", erro);
  });

  estado = "abrindo";
  botaoAbrir.disabled = true;

  const jaVirado = inicio.classList.contains("virado");

  inicio.classList.add("virado");

  const tempoGiro = movimentoReduzido.matches || jaVirado
    ? 0
    : 850;

  window.setTimeout(() => {
    inicio.classList.add("abrindo");

    const tempoAbertura = movimentoReduzido.matches
      ? 0
      : 950;

    window.setTimeout(() => {
      inicio.hidden = true;
      leitura.hidden = false;
      leitura.classList.add("entrando");

      musicaCarta.currentTime = 0;
      musicaCarta.volume = 0.3;

      estado = "aberta";

      // Começa a leitura pela primeira página.
      paginaAtual = 0;

      // Calcula as páginas depois que o pergaminho aparece.
      calcularPaginas();

      botaoFechar.focus();

    }, tempoAbertura);

  }, tempoGiro);
}



function fecharCarta() {
  if (estado !== "aberta") return;

  musicaCarta.pause();
  musicaCarta.currentTime = 0;

  leitura.hidden = true;
  leitura.classList.remove("entrando");
  inicio.hidden = false;
  inicio.classList.remove("abrindo", "virado");
  botaoAbrir.setAttribute("aria-label", "Abrir a carta");
  botaoAbrir.disabled = false;
  estado = "fechada";
  botaoAbrir.focus();
}


/* ========== INTERAÇÃO COM O ENVELOPE ========== */

// Mouse: vira ao entrar e retorna ao sair.
botaoAbrir.addEventListener("pointerenter", (evento) => {
  if (evento.pointerType === "mouse" && estado === "fechada") {
    inicio.classList.add("virado");
  }
});

botaoAbrir.addEventListener("pointerleave", (evento) => {
  if (evento.pointerType === "mouse" && estado === "fechada") {
    inicio.classList.remove("virado");
  }
});

// Toque: identifica quando o dedo desliza.
let inicioToqueX = null;
let deslizou = false;

botaoAbrir.addEventListener("touchstart", (evento) => {
  inicioToqueX = evento.touches[0].clientX;
  deslizou = false;
}, { passive: true });

botaoAbrir.addEventListener("touchmove", (evento) => {
  if (inicioToqueX === null || estado !== "fechada") return;

  const distancia = Math.abs(
    evento.touches[0].clientX - inicioToqueX
  );

  if (distancia >= 25) {
    inicio.classList.add("virado");
    deslizou = true;
  }
}, { passive: true });

botaoAbrir.addEventListener("touchend", () => {
  inicioToqueX = null;
}, { passive: true });

// Clique: abre a carta.
// Um deslize não deve ser confundido com um clique.
botaoAbrir.addEventListener("click", () => {
  if (deslizou) {
    deslizou = false;
    return;
  }

  abrirCarta();
});

botaoFechar.addEventListener("click", fecharCarta);


/* ========== 3. PÁGINAS E BOTÕES ========== */

const conteudoPaginado = document.querySelector("#conteudo-paginado");
const botaoAnterior = document.querySelector("#anterior");
const botaoProxima = document.querySelector("#proxima");
const contador = document.querySelector("#contador");

let paginaAtual = 0;
let totalPaginas = 1;
let posicoesPaginas = [0];


/* Calcula quantas páginas o texto ocupa */



function calcularPaginas() {
  const largura = conteudoPaginado.clientWidth;

  if (largura === 0) return;

  // Define a largura da coluna conforme o espaço disponível.
  conteudoPaginado.style.columnWidth = `${largura}px`;

  // Volta ao início antes de medir as posições.
  conteudoPaginado.scrollLeft = 0;

  const origem = conteudoPaginado.getBoundingClientRect().left;

  const posicoes = new Set([0]);

  // Identifica todos os capítulos da carta.
  const capitulos = conteudoPaginado.querySelectorAll(".pagina");

  capitulos.forEach((capitulo) => {
    // Um capítulo pode ocupar várias colunas.
    const fragmentos = capitulo.getClientRects();

    for (const fragmento of fragmentos) {
      if (fragmento.width === 0 || fragmento.height === 0) {
        continue;
      }

      // Mede a posição real de cada fragmento.
      const posicao = Math.round(fragmento.left - origem);

      if (posicao >= 0) {
        posicoes.add(posicao);
      }
    }
  });

  // Ordena as posições da primeira até a última página.
  posicoesPaginas = [...posicoes].sort((a, b) => a - b);

  totalPaginas = posicoesPaginas.length;

  // Garante que a página atual continue válida.
  paginaAtual = Math.min(paginaAtual, totalPaginas - 1);

  atualizarPagina(paginaAtual);
}



/* Exibe a página escolhida */


function atualizarPagina(numero) {
  if (numero < 0 || numero >= totalPaginas) return;

  paginaAtual = numero;

  // Usa a posição real da página calculada pelo navegador.
  const deslocamento = posicoesPaginas[paginaAtual];

  // Alinha o início da página à esquerda do pergaminho.
  conteudoPaginado.scrollLeft = deslocamento;

  // Atualiza o contador.
  contador.textContent =
    `Página ${paginaAtual + 1} de ${totalPaginas}`;

  // Controla os botões de navegação.
  botaoAnterior.disabled = paginaAtual === 0;
  botaoProxima.disabled = paginaAtual === totalPaginas - 1;
}


/* Navegação pelos botões */

botaoAnterior.addEventListener("click", () => {
  atualizarPagina(paginaAtual - 1);
});

botaoProxima.addEventListener("click", () => {
  atualizarPagina(paginaAtual + 1);
});


/* Navegação pelo teclado */

document.addEventListener("keydown", (evento) => {
  if (estado !== "aberta") return;

  if (evento.key === "ArrowRight") {
    atualizarPagina(paginaAtual + 1);
  }

  if (evento.key === "ArrowLeft") {
    atualizarPagina(paginaAtual - 1);
  }

  if (evento.key === "Escape") {
    fecharCarta();
  }
});


/* Recalcula quando a janela muda de tamanho */

window.addEventListener("resize", () => {
  if (estado === "aberta") {
    calcularPaginas();
  }
});


/* Recalcula depois que as fontes terminam de carregar */

document.fonts.ready.then(() => {
  if (estado === "aberta") {
    calcularPaginas();
  }
});

/* ========== 4. INICIAR O SITE ========== */
criarElementosFlutuantes();
atualizarPagina(0);
