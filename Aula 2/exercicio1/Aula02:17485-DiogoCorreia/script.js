function atualizaTexto() {
   var texto = document.getElementById("inputTexto").value;
  if (!texto.length) alert("Escreva algo no input");
   document.getElementById("texto").innerHTML = texto;
}