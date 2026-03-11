const btn = document.getElementById("verProdutos");
const agulha = document.getElementById("agulha");
const linha = document.getElementById("linha");
const overlay = document.getElementById("costuraOverlay");

btn.addEventListener("click", function(e){
    e.preventDefault();

    agulha.classList.add("costurando");
    linha.classList.add("costurando");
    overlay.classList.add("ativo");

    setTimeout(()=>{
        window.location.href = "produtos.html";
    },1500);
});