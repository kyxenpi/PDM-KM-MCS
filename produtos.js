const transicao = document.getElementById("transicao")

setTimeout(() => {

if(transicao){
transicao.style.display = "none"
}

},1200)


async function calcularFrete(){

const cep = document
.getElementById("cep")
.value
.replace(/\D/g,"")

const resultado = document.getElementById("frete-resultado")

resultado.style.display = "none"
resultado.innerText = ""

if(cep.length !== 8){
resultado.innerText = "CEP inválido"
resultado.style.display = "inline-block"
return
}

try{

const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`)

if(!resposta.ok){
throw new Error()
}

const dados = await resposta.json()

if(dados.erro){
resultado.innerText = "CEP não encontrado"
resultado.style.display = "inline-block"
return
}

/* frete exemplo */
const frete = (Math.random()*20 + 10).toFixed(2)

resultado.innerHTML =
`Entrega para ${dados.localidade} - ${dados.uf}<br>
Frete estimado: R$ ${frete}<br>
Prazo: 5-8 dias`

resultado.style.display = "inline-block"

}catch{

resultado.innerText = "Erro ao calcular frete"
resultado.style.display = "inline-block"

}

}