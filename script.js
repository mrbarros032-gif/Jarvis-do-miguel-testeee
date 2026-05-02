const API_KEY = "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";

const chat = document.getElementById("chat");

function addMensagem(texto, tipo) {
  const div = document.createElement("div");
  div.classList.add("msg", tipo);
  div.innerText = texto;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

/* =========================
   🔥 FILA DE MENSAGENS
========================= */

let fila = [];
let processando = false;
let podeEnviar = true;

/* =========================
   ➕ ENTRAR NA FILA
========================= */
function adicionarNaFila(texto) {
  fila.push(texto);
  processarFila();
}

/* =========================
   🔁 RETRY DA API
========================= */
async function enviarComRetry(mensagem, tentativas = 2) {
  for (let i = 0; i < tentativas; i++) {
    try {
      const resposta = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "qwen/qwen3-coder:free",
          messages: [
            { role: "user", content: mensagem }
          ]
        })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(JSON.stringify(dados));
      }

      return dados.choices?.[0]?.message?.content;

    } catch (err) {
      console.log("Retry:", i + 1);

      await new Promise(r => setTimeout(r, 2000));
    }
  }

  return "❌ Falhou após várias tentativas.";
}

/* =========================
   📬 PROCESSAR FILA
========================= */
async function processarFila() {
  if (processando) return;
  processando = true;

  while (fila.length > 0) {

    if (!podeEnviar) {
      await new Promise(r => setTimeout(r, 1000));
      continue;
    }

    const mensagem = fila.shift();

    addMensagem(mensagem, "user");
    addMensagem("Pensando...", "bot");

    const resposta = await enviarComRetry(mensagem);

    chat.lastChild.remove();
    addMensagem(resposta, "bot");

    // 🔥 COOLDOWN 5s
    podeEnviar = false;
    await new Promise(r => setTimeout(r, 5000));
    podeEnviar = true;
  }

  processando = false;
}

/* =========================
   🔘 BOTÃO
========================= */
document.getElementById("botao").addEventListener("click", () => {
  const input = document.getElementById("input");
  const texto = input.value.trim();

  if (!texto) return;

  input.value = "";

  adicionarNaFila(texto);
});
