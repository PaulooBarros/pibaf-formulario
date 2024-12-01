const formulario = document.getElementById('formulario');
const opcoes = document.getElementById('opcoes');
const lista = document.getElementById('lista');
const mensagemErro = document.getElementById('mensagemErro');

// Função para carregar as opções disponíveis, verificando se o limite de cada item foi atingido.
function carregarOpcoes() {
    axios.get('http://localhost:3000/opcoesDeItens') 
        .then(response => {
            const opcoesDisponiveis = response.data;

            opcoes.innerHTML = '<option value="">-- Selecione --</option>';

            // Para cada opção, verifica se o limite foi atingido
            opcoesDisponiveis.forEach(opcao => {
                verificarQuantidadeItens(opcao.tipo, opcao.limite).then(excedeuLimite => {
                    const option = document.createElement('option');
                    option.value = opcao.id; 
                    option.textContent = `${opcao.tipo} (${opcao.quantidade})`;
                    
                    // Se excedeu o limite, desabilita a opção
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

// Função para verificar a quantidade de itens cadastrados para cada tipo de prato.
function verificarQuantidadeItens(tipoPrato, limite) {
    return axios.get('http://localhost:3000/itensCadastrados')
        .then(response => {
            const itens = response.data;
            const quantidade = itens.filter(item => item.opcaoSelecionada === tipoPrato).length;
            
            // Retorna true se a quantidade de itens já cadastrados atingiu o limite
            return quantidade >= limite;
        });
}

// Função para carregar os itens cadastrados e exibir na lista
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

// Função para exibir mensagens de erro ou sucesso.
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

// Função chamada ao submeter o formulário, para garantir que o limite de itens seja respeitado.
formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = formulario.nome.value;
    const opcaoSelecionada = opcoes.value;
    const opcaoTexto = opcoes.options[opcoes.selectedIndex].text;

    if (!opcaoSelecionada) {
        mostrarMensagem('Por favor, selecione um prato!', 'erro');
        return;
    }

    // Verifica se o limite foi atingido antes de adicionar o item
    const tipoPrato = opcaoTexto.split(' ')[0]; // Extrai o tipo (Exemplo: "Arroz")
    const limite = 3; // Defina o limite de itens para cada prato, de acordo com seu modelo de dados

    verificarQuantidadeItens(tipoPrato, limite).then(excedeuLimite => {
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
