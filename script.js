const API_KEY = "AIzaSyDd0CX2VG1yH8f4APd4Yqbvj1VVwrk3Yl0";

// ===== CHAT =====
const chat = document.getElementById("chat");

// adiciona mensagem na tela
function addMensagem(texto, tipo) {
  const div = document.createElement("div");
  div.className = tipo;
  div.innerText = texto;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// ===== CONTROLE =====
let fila = [];
let processando = false;
let bloqueado = false;

// ===== BOTÃO =====
document.getElementById("botao").addEventListener("click", () => {
  const input = document.getElementById("input");
  const texto = input.value.trim();

  if (!texto) return;

  input.value = "";
  fila.push(texto);

  processarFila();
});

// ===== FILA =====
async function processarFila() {
  if (processando) return;
  processando = true;

  while (fila.length > 0) {

    if (bloqueado) {
      await new Promise(r => setTimeout(r, 1000));
      continue;
    }

    const mensagem = fila.shift();

    addMensagem(mensagem, "user");
    addMensagem("Pensando...", "bot");

    const resposta = await enviarComRetry(mensagem);

    // remove "pensando..."
    chat.lastChild.remove();

    addMensagem(resposta, "bot");

    // cooldown de 5s
    bloqueado = true;
    await new Promise(r => setTimeout(r, 5000));
    bloqueado = false;
  }

  processando = false;
}

// ===== GEMINI REQUEST =====
async function enviarMensagem(texto) {
  const resposta = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: texto }]
          }
        ]
      })
    }
  );

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(JSON.stringify(dados));
  }

  return dados?.candidates?.[0]?.content?.parts?.[0]?.text
    || "Sem resposta da IA";
}

// ===== RETRY =====
async function enviarComRetry(texto, tentativas = 2) {
  for (let i = 0; i < tentativas; i++) {
    try {
      return await enviarMensagem(texto);
    } catch (err) {
      console.log("Retry:", i + 1);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  return "❌ Falhou após várias tentativas.";
                }
