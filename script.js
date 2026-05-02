const API_KEY = "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";

async function enviarMensagem(mensagemUsuario) {
  const resposta = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${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}`,
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
  return dados.choices[0].message.content;
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
  const texto = input.value;

  if (!texto) return;

  addMensagem(texto, "user");
  input.value = "";

  const loading = document.createElement("div");
  loading.classList.add("msg", "bot");
  loading.innerText = "Pensando...";
  chat.appendChild(loading);

  try {
    const resposta = await enviarMensagem(texto);
    loading.remove();
    addMensagem(resposta, "bot");
  } catch (erro) {
    loading.innerText = "Erro ao responder.";
    console.log(erro);
  }
});
