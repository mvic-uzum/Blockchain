var sha256 = function sha256(ascii) { //código que peguei pronto para o cálculo do hash
	function rightRotate(value, amount) {
		return (value>>>amount) | (value<<(32 - amount));
	};

	var mathPow = Math.pow;
	var maxWord = mathPow(2, 32);
	var lengthProperty = 'length'
	var i, j;
	var result = ''

	var words = [];
	var asciiBitLength = ascii[lengthProperty]*8;
	var hash = sha256.h = sha256.h || [];
	var k = sha256.k = sha256.k || [];
	var primeCounter = k[lengthProperty];

	var isComposite = {};
	for (var candidate = 2; primeCounter < 64; candidate++) {
		if (!isComposite[candidate]) {
			for (i = 0; i < 313; i += candidate) {
				isComposite[i] = candidate;
			}
			hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
			k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
		}
	}

	ascii += '\x80'
	while (ascii[lengthProperty]%64 - 56) ascii += '\x00'
	for (i = 0; i < ascii[lengthProperty]; i++) {
		j = ascii.charCodeAt(i);
		if (j>>8) return;
		words[i>>2] |= j << ((3 - i)%4)*8;
	}
	words[words[lengthProperty]] = ((asciiBitLength/maxWord)|0);
	words[words[lengthProperty]] = (asciiBitLength)

	for (j = 0; j < words[lengthProperty];) {
		var w = words.slice(j, j += 16);
		var oldHash = hash;
		hash = hash.slice(0, 8);

		for (i = 0; i < 64; i++) {
			var i2 = i + j;
			var w15 = w[i - 15], w2 = w[i - 2];

			var a = hash[0], e = hash[4];
			var temp1 = hash[7]
				+ (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
				+ ((e&hash[5])^((~e)&hash[6]))
				+ k[i]
				+ (w[i] = (i < 16) ? w[i] : (
						w[i - 16]
						+ (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3))
						+ w[i - 7]
						+ (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10))
					)|0
				);
			var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
				+ ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2]));

			hash = [(temp1 + temp2)|0].concat(hash);
			hash[4] = (hash[4] + temp1)|0;
		}

		for (i = 0; i < 8; i++) {
			hash[i] = (hash[i] + oldHash[i])|0;
		}
	}

	for (i = 0; i < 8; i++) {
		for (j = 3; j + 1; j--) {
			var b = (hash[i]>>(j*8))&255;
			result += ((b < 16) ? 0 : '') + b.toString(16);
		}
	}
	return result;
};

function getNum(message){ //gera a mensagem que pede a dificuldade
  var userInput = prompt(message) * 1;
  do{
    if(!(userInput==parseInt(userInput,10)) || userInput==""){ //confere se o valor inserido é um número inteiro e se há algo digitado no campo
			alert("Insira apenas números inteiros na dificuldade!");
			userInput = prompt(message) * 1;
		}
  }
	while(!(userInput==parseInt(userInput,10)) || userInput=="");
     return userInput;
}

function calculoHash(indexbloco,dado,ultimoHash,nonce) { //calcula o hash usando a função sha256 acima
    return sha256(indexbloco + dado + ultimoHash + nonce).toString();
}

function mineraBloco(indexbloco, dado, ultimoHash){ //minera o bloco a partir da dificuldade estipulada
	var flag = 1;
	var nonce = -1;
	do {
      nonce++;
      var hash = calculoHash(indexbloco,dado,ultimoHash,nonce);
	  for(c=0;c<dificuldade;c++) { //coloca o número de 0's correspondentes a dificuldade no início do hash
		  if(hash[c] != 0) {
			  flag = 1;
			  break;
		  }
		  flag = 0;
	  }
    } while(flag == 1);
    return nonce;
}

function validaChain(){ //função que faz alterações, validações e também chama a mineração
	var tamChain = $('[id^="blocos"]').length;
	for(i=0;i<tamChain;i++){ //percorre todos os blocos
		var vetorHash = $('[id^="hash'+i+'"]').text(); //recebe o o valor do hash
		var vetorDado = $('[id^="dado'+i+'"]').val(); //recebe o valor do dado
		if(vetorDado==""){ //verifica se há algo no campo dado caso ele tenha sido alterado - não é possível deixá-lo em branco
			alert("Por favor, insira um valor no campo destinado ao Dado!");
			vetorDado = "Dado Provisório...";
			$('#dado'+i).val(vetorDado);
			return;
		}
		if(i==0){ //se for o primeiro bloco, recebe o valor do último hash registrado nele, já que esse valor nunca é alterado
			var vetorUltimoHash = $('[id^="hashultimobloco'+i+'"]').text();
		}
		else{ //se não for o primeiro bloco, calcula o hash do bloco anterior e recebe esse valor como hash do último bloco
			var vetorUltimoHash = calculoHash(i-1,$('[id^="dado'+(i-1)+'"]').val(),$('[id^="hashultimobloco'+(i-1)+'"]').text(),$('[id^="nonce'+(i-1)+'"]').text());
			$('[id^="hashultimobloco'+i+'"]').text(vetorUltimoHash);
		}
		var vetorNonce = $('[id^="nonce'+i+'"]').text(); //recebe o valor do nonce
		if(vetorHash !== calculoHash(i,vetorDado,vetorUltimoHash,vetorNonce)){ //verifica se o hash do bloco bate com seu cálculo do hash
			alert("O Bloco " +i+ " é inválido e será validado agora!");
			//var startTime = new Date().getTime(); //para cronometrar o tempo de mineração
			var novoNonce = mineraBloco(i,vetorDado,vetorUltimoHash); //chama a função minera bloco
			/*endTime = new Date().getTime(); //obtém o tempo final e subtrai do inicial para encontrar o tempo total de execução da mineração
			var time = endTime - startTime;
			times = time/1000;
			var segundos = Math.round(times);
			console.log(times + " segundos");*/
			var novoHash = calculoHash(i,vetorDado,vetorUltimoHash,novoNonce); //realiza o novo cálculo do hash
			$('[id^="hash'+i+'"]').html(novoHash); //atualiza o hash e o nonce do bloco no html
			$('[id^="nonce'+i+'"]').html(novoNonce);
		}
		var hashAnterior = $('[id^="hash'+(i-1)+'"]').text(); //recebe o valor do hash do último bloco
		if(i>0 && hashAnterior !== vetorUltimoHash){ //verifica se o campo último hash bate com o hash do bloco anterior
			var ultimoHashNovo = hashAnterior;
			$('[id^="hashultimobloco'+(i-1)+'"]').html(ultimoHashNovo); //atuliza o último hash com o novo hash do último bloco
		}
	}
	alert("A Blockchain é válida!");
}
