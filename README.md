# CriandoAPI
Aplicativo elaborado como forma de trabalho apresentado para disciplina de Programação para Internet II vinculado ao Curso Superior em Análise e Desenvolvimento de Sistemas, do Instituto Federal de Educação, Ciência e Tecnologia do Triângulo Mineiro (IFTM) - Campus Ituiutaba.

**GET /filmes/:pagina**
Retorna todas as informações de 10 filmes, de acordo com a página informada. Se página for 1 serão retornados os 10 primeiros filmes, se página for 2 serão retornados os filmes nas posições 11 até 20 e assim sucessivamente. A ordem dos filmes deverá ser pela sua nota decrescente, ou seja, do melhor para o pior.

**GET /filme/:id**
Retorna todas as informações do filme de acordo com o id informado, bem como seu gênero e todos os seus atores.

**GET /filmes/busca/:palavra**
Retorna todas as informações dos filmes que satisfazerem a busca, bem como seu gênero e todos os seus atores.

**GET /generos/:genero**
Retorna o nome de todos os filmes que pertencerem ao gênero informado.

**GET /ator/:id**
Retorne o nome do ator e o nome de todos os filmes que ele participou, de acordo com o id informado.

**GET /atores/busca/:palavra**
Retorne o nome dos atores e o nome dos filmes que cada um dos atores participou, de acordo com a palavra buscada. Não se esqueça de retornar um JSON estruturado, com uma lista de atores e cada um desses atores com uma lista de filmes.

**POST /atores**
Cria um novo ator. Em caso de sucesso retorne o ID do ator criado. Caso contrário
retorne uma mensagem de erro.

**PUT /atores**
Edita o nome de um ator existente, informado através de seu id. Em caso de sucesso
retorne o ID do ator modificado. Caso contrário retorne uma mensagem de erro.

**DELETE /atores/:id**
Remove o ator com id informado. Remova também os registros que vinculam este ator
aos filmes que ele participou (tabela atores_filmes). Em caso de sucesso retorne o ID do
ator removido. Caso contrário retorne uma mensagem de erro.

**POST /participacoes/:idAtor/:idFilme**
Cadastra uma participação em um filme de um ator informado. Em caso de sucesso
retorne o ID da tabela utilizada. Caso contrário retorne uma mensagem de erro.

**DELETE /participacoes/:idAtor/:idFilme**
Remove uma participação em um filme de um ator informado. Em caso de sucesso
retorne o ID do registro removido da tabela utilizada. Caso contrário retorne uma
mensagem de erro.
