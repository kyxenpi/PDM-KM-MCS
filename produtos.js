const transicao = document.getElementById("transicao");

setTimeout(() => {
  if (transicao) {
    transicao.style.display = "none";
  }
}, 1200);

// --- CÁLCULO DE FRETE ---
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
    if (!resposta.ok) throw new Error();

    const dados = await resposta.json();
    if (dados.erro) {
      resultado.innerText = "CEP não encontrado";
      resultado.style.display = "inline-block";
      return;
    }

    const frete = (Math.random() * 20 + 10).toFixed(2);
    resultado.innerHTML = `Entrega para ${dados.localidade} - ${dados.uf}<br>Frete estimado: R$ ${frete}<br>`;
    resultado.style.display = "inline-block";
  } catch {
    resultado.innerText = "Erro ao calcular frete";
    resultado.style.display = "inline-block";
  }
}

document.getElementById("btn-frete").addEventListener("click", calcularFrete);

// --- LIGHTBOX (AMPLIAR IMAGEM) ---
const lightbox = document.getElementById("lightbox");
const imgLightbox = lightbox.querySelector("img");

function configurarLightbox() {
  document.querySelectorAll(".produto img, .galeria-grid img").forEach((img) => {
    // Evita duplicar listeners limpando antes
    img.removeEventListener("click", abrirLightbox);
    img.addEventListener("click", abrirLightbox);
  });
}

function abrirLightbox(e) {
  imgLightbox.src = e.target.src;
  lightbox.classList.add("ativo");
}

lightbox.addEventListener("click", (e) => {
  if (e.target !== imgLightbox) {
    lightbox.classList.remove("ativo");
  }
});

let startY = 0;
lightbox.addEventListener("touchstart", (e) => { startY = e.touches[0].clientY; });
lightbox.addEventListener("touchend", (e) => {
  let endY = e.changedTouches[0].clientY;
  if (Math.abs(endY - startY) > 80) {
    lightbox.classList.remove("ativo");
  }
});

// --- BUSCA DE PRODUTOS ---
const busca = document.getElementById("busca");
busca.addEventListener("input", () => {
  const termo = busca.value.toLowerCase();
  document.querySelectorAll(".produto").forEach((p) => {
    const nome = p.querySelector("h3").innerText.toLowerCase();
    p.style.display = nome.includes(termo) ? "flex" : "none";
  });
});

// --- BOTÃO VOLTAR AO TOPO ---
const topo = document.getElementById("topo");
window.addEventListener("scroll", () => {
  topo.style.display = window.scrollY > 400 ? "block" : "none";
});
topo.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });

// --- GERENCIAMENTO DO CARRINHO ---
const cartIcon = document.getElementById("abrir-carrinho");
const carrinho = document.getElementById("carrinho");
const fechar = document.getElementById("fechar-carrinho");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const finalizar = document.getElementById("finalizar");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function toggleCart() {
  carrinho.classList.toggle("ativo");
  overlay.classList.toggle("ativo");
}

cartIcon.onclick = toggleCart;
fechar.onclick = toggleCart;
overlay.onclick = toggleCart;

// Adicionar ao carrinho com tratamento de variações de texto
document.querySelectorAll(".produto button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const produtoCard = btn.parentElement;
    let nomeOriginal = produtoCard.querySelector("h3").innerText;
    let preco;
    let nomeFinal = nomeOriginal;

    const select = produtoCard.querySelector(".variacao");
    if (select) {
      preco = parseFloat(select.value);
      const textoVariacao = select.options[select.selectedIndex].text.split("-")[0].trim();
      nomeFinal = `${nomeOriginal} (${textoVariacao})`;
    } else {
      preco = parseFloat(
        produtoCard.querySelector(".preco").innerText.replace("R$", "").replace(",", ".")
      );
    }

    const existente = cart.find((p) => p.nome === nomeFinal);
    if (existente) {
      existente.qtd++;
    } else {
      cart.push({ nome: nomeFinal, preco: preco, qtd: 1 });
    }

    salvarCarrinho();
    renderCart();
  });
});

function salvarCarrinho() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

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
  cartCount.innerText = cart.reduce((acc, item) => acc + item.qtd, 0);
}

window.aumentar = function(i) { cart[i].qtd++; salvarCarrinho(); renderCart(); };
window.diminuir = function(i) {
  if (cart[i].qtd > 1) cart[i].qtd--;
  else cart.splice(i, 1);
  salvarCarrinho(); renderCart();
};
window.remover = function(i) { cart.splice(i, 1); salvarCarrinho(); renderCart(); };

// Finalizar pedido via WhatsApp
finalizar.onclick = () => {
  if (cart.length === 0) {
    alert("Carrinho vazio");
    return;
  }
  let mensagem = "Olá! Gostaria de fazer um pedido:%0A%0A";
  cart.forEach((item) => {
    mensagem += `${item.nome} x${item.qtd} - R$ ${(item.preco * item.qtd).toFixed(2)}%0A`;
  });
  
  const totalPedido = cart.reduce((acc, item) => acc + (item.preco * item.qtd), 0).toFixed(2);
  mensagem += `%0ATotal do Pedido: R$ ${totalPedido}`;

  const url = `https://wa.me/5513981846888?text=${mensagem}`;
  window.open(url, "_blank");
};

// --- INTERSECTION OBSERVER (ANIMAÇÃO DOS CARDS) ---
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(".produto").forEach((el) => {
  observer.observe(el);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    carrinho.classList.remove("ativo");
    overlay.classList.remove("ativo");
  }
});

// --- INICIALIZAÇÃO DE MINIATURAS E GALERIA CORRIGIDA ---
document.addEventListener("DOMContentLoaded", () => {
  const galeriaContainer = document.getElementById("galeria");
  if (galeriaContainer) galeriaContainer.innerHTML = "";

  document.querySelectorAll(".produto").forEach((produto) => {
    let imagens = [];
    if (produto.dataset.images) {
      try { imagens = JSON.parse(produto.dataset.images); } catch { imagens = []; }
    } else {
      const img = produto.querySelector("img");
      if (img) imagens.push(img.getAttribute("src"));
    }

    // Configura as miniaturas internas do card, se houver mais de uma imagem
    const thumbContainer = produto.querySelector(".miniaturas");
    const principal = produto.querySelector("img");
    
    if (thumbContainer && imagens.length > 1) {
      thumbContainer.innerHTML = "";
      imagens.forEach((src) => {
        const thumb = document.createElement("img");
        thumb.src = src;
        thumb.alt = "Miniatura do produto";
        thumb.onclick = (e) => {
          e.stopPropagation();
          principal.src = src;
        };
        thumbContainer.appendChild(thumb);
      });
    }

    // Alimenta a galeria global sem duplicar itens
    if (galeriaContainer) {
      imagens.forEach((src) => {
        const imgGaleria = document.createElement("img");
        imgGaleria.src = src;
        imgGaleria.alt = "Imagem da galeria de crochê";
        imgGaleria.loading = "lazy";
        galeriaContainer.appendChild(imgGaleria);
      });
    }
  });

  renderCart();
  configurarLightbox();
});

// --- CONTROLE DE ABAS (PRODUTOS VS GALERIA) ---
const btnProdutos = document.getElementById("btn-produtos");
const btnGaleria = document.getElementById("btn-galeria");
const secaoProdutos = document.getElementById("secao-produtos");
const secaoGaleria = document.getElementById("secao-galeria");

btnProdutos.onclick = () => {
  secaoProdutos.style.display = "block";
  secaoGaleria.style.display = "none";
  busca.style.display = "inline-block";
};

btnGaleria.onclick = () => {
  secaoProdutos.style.display = "none";
  secaoGaleria.style.display = "block";
  busca.style.display = "none";
  configurarLightbox(); // Atualiza os listeners para os novos elementos da galeria
};
