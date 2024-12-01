const formulario = document.getElementById('formulario');
const opcoes = document.getElementById('opcoes');
const lista = document.getElementById('lista');
const mensagemErro = document.getElementById('mensagemErro');

function carregarOpcoes() {
    axios.get('http://localhost:3000/opcoesDeItens') 
        .then(response => {
            const opcoesDisponiveis = response.data;

            opcoes.innerHTML = '<option value="">-- Selecione --</option>';

            opcoesDisponiveis.forEach(opcao => {
                verificarQuantidadeItens(opcao.tipo).then(excedeuLimite => {
                    const option = document.createElement('option');
                    option.value = opcao.id; 
                    option.textContent = `${opcao.tipo} (${opcao.quantidade})`;
                    
                    if (excedeuLimite) {
                        option.disabled = true;
                        option.textContent += ' - Limite atingido';
                    }

                    opcoes.appendChild(option);
                });
            });
        })
        .catch(error => {
            console.error('Erro ao carregar opções:', error);
            mostrarMensagem('Ocorreu um erro ao carregar as opções.', 'erro');
        });
}

function carregarItens() {
    axios.get('http://localhost:3000/itensCadastrados')
        .then(response => {
            const itens = response.data;
            const lista = document.querySelector('.lista-itens-cadastrados'); 

            lista.innerHTML = '';

            itens.forEach(item => {
                const divItem = document.createElement('div');
                divItem.classList.add('item');

                divItem.innerHTML = `
                    <span>${item.nome}</span>
                    <span>${item.opcaoSelecionada}</span>
                `;

                lista.appendChild(divItem);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar itens cadastrados:', error);
            mostrarMensagem('Ocorreu um erro ao carregar os itens.', 'erro');
        });
}


function mostrarMensagem(mensagem, tipo) {
    mensagemErro.textContent = mensagem;
    mensagemErro.classList.add(tipo); 
    mensagemErro.classList.add('show'); 
    mensagemErro.style.display = 'block';

    // Esconde a mensagem após o tempo definido
    const tempo = tipo === 'erro' ? 5000 : 4000; 
    setTimeout(() => {
        mensagemErro.classList.remove('show'); 
        mensagemErro.style.display = 'none';

        if (tipo === 'sucesso') {
            location.reload();
        }
    }, tempo);
}


function verificarQuantidadeItens(tipoPrato) {
    return axios.get('http://localhost:3000/itensCadastrados')
        .then(response => {
            const itens = response.data;
            const quantidade = itens.filter(item => item.opcaoSelecionada === tipoPrato).length;
            
            return quantidade >= 3;
        });
}

formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = formulario.nome.value;
    const opcaoSelecionada = opcoes.value;
    const opcaoTexto = opcoes.options[opcoes.selectedIndex].text;

    if (!opcaoSelecionada) {
        mostrarMensagem('Por favor, selecione um prato!', 'erro');
        return;
    }

    verificarQuantidadeItens(opcaoTexto).then(excedeuLimite => {
        if (excedeuLimite) {
            mostrarMensagem('A quantidade máxima de itens foi atingida para esse prato!', 'erro');
        } else {
            const novoItem = {
                nome: nome,
                opcaoSelecionada: opcaoTexto,
            };

            // Adiciona o novo item ao servidor (simulando um POST com axios)
            axios.post('http://localhost:3000/itensCadastrados', novoItem)
                .then(response => {
                    carregarItens();
                    formulario.reset();
                    mostrarMensagem('Item adicionado com sucesso!', 'sucesso');
                })
                .catch(error => {
                    console.error('Erro ao adicionar item:', error);
                    mostrarMensagem('Ocorreu um erro ao adicionar o item.', 'erro');
                });
        }
    });
});

carregarOpcoes();
carregarItens();
