var numeros = [];

function inserirNumero() {
   numeros.push(document.getElementById("inputNumeros").value);
   document.getElementById("numeros").innerHTML = numeros;
}

function calculaMaior() {
  if (numeros.length>4){
     document.getElementById("maior").innerText = Math.max.apply(Math, numeros);
  }
  else alert("introduza por favor 5 números");

}