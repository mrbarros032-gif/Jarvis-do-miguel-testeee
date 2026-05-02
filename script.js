const API_KEY = "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";

async function enviarMensagem(mensagemUsuario) {
  try {
    const resposta = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
        messages: [
          { role: "user", content: mensagemUsuario }
        ]
      })
    });

    const dados = await resposta.json();

    console.log("RESPOSTA DA API:", dados);

    if (!resposta.ok) {
      throw new Error(dados.error?.message || "Erro na API");
    }

    if (!dados.choices || !dados.choices[0]) {
      throw new Error("Resposta inválida da API");
    }

    return dados.choices[0].message.content;

  } catch (erro) {
    console.log("ERRO COMPLETO:", erro);
    return "Erro ao responder.";
  }
}

const chat = document.getElementById("chat");

function addMensagem(texto, tipo) {
  const div = document.createElement("div");
  div.classList.add("msg", tipo);
  div.innerText = texto;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

document.getElementById("botao").addEventListener("click", async () => {
  const input = document.getElementById("input");
  const texto = input.value.trim();

  if (!texto) return;

  addMensagem(texto, "user");
  input.value = "";

  const loading = document.createElement("div");
  loading.classList.add("msg", "bot");
  loading.innerText = "Pensando...";
  chat.appendChild(loading);

  const resposta = await enviarMensagem(texto);

  loading.remove();
  addMensagem(resposta, "bot");
});
