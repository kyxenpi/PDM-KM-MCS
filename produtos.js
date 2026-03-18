const transicao = document.getElementById("transicao");

setTimeout(() => {
  if (transicao) {
    transicao.style.display = "none";
  }
}, 1200);

async function calcularFrete() {
  const cep = document.getElementById("cep").value.replace(/\D/g, "");

  const resultado = document.getElementById("frete-resultado");

  resultado.style.display = "none";
  resultado.innerText = "";

  if (cep.length !== 8) {
    resultado.innerText = "CEP inválido";
    resultado.style.display = "inline-block";
    return;
  }

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

    if (!resposta.ok) {
      throw new Error();
    }

    const dados = await resposta.json();

    if (dados.erro) {
      resultado.innerText = "CEP não encontrado";
      resultado.style.display = "inline-block";
      return;
    }

    /* frete exemplo */
    const frete = (Math.random() * 20 + 10).toFixed(2);

    resultado.innerHTML = `Entrega para ${dados.localidade} - ${dados.uf}<br>
Frete estimado: R$ ${frete}<br>
Prazo: 5-8 dias`;

    resultado.style.display = "inline-block";
  } catch {
    resultado.innerText = "Erro ao calcular frete";
    resultado.style.display = "inline-block";
  }
}

const imagens = document.querySelectorAll(".produto img");

/* cria lightbox */
const lightbox = document.createElement("div");
lightbox.className = "lightbox";

const imgLightbox = document.createElement("img");

lightbox.appendChild(imgLightbox);
document.body.appendChild(lightbox);

/* abrir imagem */
imagens.forEach((img) => {
  img.addEventListener("click", () => {
    imgLightbox.src = img.src;
    lightbox.classList.add("ativo");
  });
});

/* clicar fora fecha */
lightbox.addEventListener("click", (e) => {
  if (e.target !== imgLightbox) {
    lightbox.classList.remove("ativo");
  }
});

/* swipe para fechar (mobile) */
let startY = 0;

lightbox.addEventListener("touchstart", (e) => {
  startY = e.touches[0].clientY;
});

lightbox.addEventListener("touchend", (e) => {
  let endY = e.changedTouches[0].clientY;

  if (Math.abs(endY - startY) > 80) {
    lightbox.classList.remove("ativo");
  }
});

const busca = document.getElementById("busca");

busca.addEventListener("input", () => {
  const termo = busca.value.toLowerCase();

  document.querySelectorAll(".produto").forEach((p) => {
    const nome = p.querySelector("h3").innerText.toLowerCase();

    p.style.display = nome.includes(termo) ? "block" : "none";
  });
});

const topo = document.getElementById("topo");

window.addEventListener("scroll", () => {
  topo.style.display = window.scrollY > 400 ? "block" : "none";
});

topo.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });

const cartIcon = document.getElementById("abrir-carrinho");
const carrinho = document.getElementById("carrinho");
const fechar = document.getElementById("fechar-carrinho");
const overlay = document.getElementById("overlay");

const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const finalizar = document.getElementById("finalizar");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* abrir carrinho */

function toggleCart() {
  carrinho.classList.toggle("ativo");
  overlay.classList.toggle("ativo");
}

cartIcon.onclick = toggleCart;

fechar.onclick = () => {
  carrinho.classList.remove("ativo");
  overlay.classList.remove("ativo");
};

/* clicar fora fecha */
overlay.onclick = () => {
  carrinho.classList.remove("ativo");
  overlay.classList.remove("ativo");
};

/* adicionar produto */

document.querySelectorAll(".produto button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const nome = btn.parentElement.querySelector("h3").innerText;

    const preco = btn.parentElement
      .querySelector(".preco")
      .innerText.replace("R$", "")
      .replace(",", ".")
      .trim();

    const existente = cart.find((p) => p.nome === nome);

    if (existente) {
      existente.qtd++;
    } else {
      cart.push({
        nome: nome,
        preco: parseFloat(preco),
        qtd: 1,
      });
    }

    salvarCarrinho();
    renderCart();
  });
});

/* salvar */

function salvarCarrinho() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* renderizar */

function renderCart() {
  cartItems.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
<span>${item.nome}</span>

<button onclick="diminuir(${index})">-</button>

<span>${item.qtd}</span>

<button onclick="aumentar(${index})">+</button>

<span>R$ ${(item.preco * item.qtd).toFixed(2)}</span>

<button class="remover" onclick="remover(${index})">x</button>
`;

    cartItems.appendChild(div);

    total += item.preco * item.qtd;
  });

  cartTotal.innerText = total.toFixed(2);
  cartCount.innerText = cart.length;
}

/* controles */

function aumentar(i) {
  cart[i].qtd++;
  salvarCarrinho();
  renderCart();
}

function diminuir(i) {
  if (cart[i].qtd > 1) {
    cart[i].qtd--;
  } else {
    cart.splice(i, 1);
  }

  salvarCarrinho();
  renderCart();
}

function remover(i) {
  cart.splice(i, 1);
  salvarCarrinho();
  renderCart();
}

/* finalizar pedido */

finalizar.onclick = () => {
  if (cart.length === 0) {
    alert("Carrinho vazio");
    return;
  }

  let mensagem = "Olá! Gostaria de fazer um pedido:%0A%0A";

  cart.forEach((item) => {
    mensagem += `${item.nome} x${item.qtd} - R$ ${(item.preco * item.qtd).toFixed(2)}%0A`;
  });

  const url = `https://wa.me/5513981846888?text=${mensagem}`;

  window.open(url, "_blank");
};

renderCart();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
});

document.querySelectorAll(".produto").forEach((el) => {
  observer.observe(el);
});

/* ESC fecha */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    carrinho.classList.remove("ativo");
    overlay.classList.remove("ativo");
  }
});
