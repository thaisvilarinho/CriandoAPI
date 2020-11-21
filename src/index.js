const { query } = require('express');
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Subir o servidor
app.listen(port, ()=>{
    console.log(`Servidor rodando na porta ${port}`);
});

// Conexão com o Banco de Dados
async function conecta(){
    if ( global.conexao && global.conexao.state !== 'disconneted'){
        return global.conexao;
    }

    const mysql = require('mysql2/promise');
    const conexao = await mysql.createConnection('mysql://root:@localhost:3306/iftm_filmes');
    console.log('Mysql conectado');

    global.conexao = conexao;
    return conexao;
}

// Rota 01 - raiz
app.get('/', (req, res)=>{
    return res.send('Servidor rodando')
})

// Rota 02 - GET filmes/:pagina
app.get('/filmes/:pagina', async(req, res)=>{
    let { pagina } = req.params

    try{

        if (pagina <= 0 ){throw new Error('Erro: Página inválida')}{};

        const totalFilmes = 10;
        const maxLimite = pagina * totalFilmes;
        const minLimite = (maxLimite - totalFilmes);    

        const conn = await conecta();

        const queryFilmes = 'SELECT * FROM filmes ORDER BY nota DESC LIMIT ?, ?';

        const [buscaFilmes] = await conn.query(queryFilmes, [minLimite,totalFilmes]);
        const objetoPreenchido = Object.entries(buscaFilmes).length;

        if (objetoPreenchido != false){
            return res.status(200).json( buscaFilmes );
        }else{throw new Error('Erro: Página inválida')}{};

    }catch(erro){
        return res.status(500).json({ erro: erro.message});
    };
});

// Rota 03 - GET /filme/:id
app.get('/filme/:id', async(req, res)=>{
    const { id } = req.params;

    try{

        if (id <= 0 ){throw new Error('Erro: Id inválido')}{}; 

        const conn = await conecta();

        const queryFilme = `SELECT * FROM filmes WHERE id = ?`;

        const [buscaFilme]= await conn.query(queryFilme, [ id ]);
        const objetoPreenchido = Object.entries(buscaFilme).length;

        if (objetoPreenchido != false){
            
            const queryAtores = 
            `
                SELECT titulo AS ator FROM atores_filmes
                INNER JOIN atores
                ON atores_filmes.ator_id = atores.id
                WHERE atores_filmes.filme_id = ?
            `;

            const queryGeneros = 
            `
                SELECT titulo AS genero FROM filmes_generos
                INNER JOIN generos
                ON filmes_generos.genero_id = generos.id
                WHERE filmes_generos.filme_id = ?
            `;
            const [buscaAtores] = await conn.query(queryAtores,  [ id ]);
            const [buscaGeneros] = await conn.query(queryGeneros,  [ id ]);

            let listaAtores = buscaAtores.map((item)=> item.ator);
            let listaGeneros = buscaGeneros.map((item)=> item.genero);

            if (listaAtores.length !== 0 && listaGeneros.length === 0){
                listaGeneros = 'Sem registros';
            }else if (listaAtores.length === 0 && listaGeneros.length !== 0){
                listaAtores = 'Sem registros';
            }else if (listaAtores.length === 0 && listaGeneros.length === 0){
                listaGeneros = 'Sem registros';
                listaAtores = 'Sem registros';
            };

            const {titulo, ano, duracao, sinopse, poster, nota, votos, imdb_id} = buscaFilme[0];

            const filme = {
                    id: id,
                    titulo: titulo,
                    ano: ano,
                    duracao: duracao,
                    sinopse: sinopse,
                    poster: poster,
                    nota: nota,
                    votos: votos,
                    imdb_id: imdb_id,
                    atores: listaAtores,
                    generos: listaGeneros
                };

            return res.status(200).json( filme ); 
        }else{throw new Error('Erro: Id inválido')}{};


    }catch(erro){
        return res.status(500).json({ message: erro.message });
    };
});

// Rota 04 - GET /filmes/busca/:palavra
app.get('/filmes/busca/:palavra', async(req, res)=>{
    const { palavra } = req.params

    try{
        const conn = await conecta();
        const filmes = [];

        const queryFilmes = `SELECT * FROM filmes WHERE titulo LIKE CONCAT('%',?, '%')`;
        
        const [buscaFilmes]= await conn.query(queryFilmes, [ palavra ]);
        const objetoPreenchido = Object.entries(buscaFilmes).length;

        if (objetoPreenchido != false){

            const queryAtores = 
            `
                SELECT titulo AS ator, atores_filmes.id FROM atores_filmes
                INNER JOIN atores
                ON atores_filmes.ator_id = atores.id
                WHERE atores_filmes.filme_id = ?
                
            `;
            
            const queryGeneros = 
            `
                SELECT titulo AS genero, filmes_generos.id FROM filmes_generos
                INNER JOIN generos
                ON filmes_generos.genero_id = generos.id
                WHERE filmes_generos.filme_id = ?
            `;     
    
            for(let filme = 0; filme < buscaFilmes.length; filme++){
                let {id, titulo, ano, duracao, sinopse, poster, nota, votos, imdb_id} = buscaFilmes[filme];
                let [buscaAtores] = await conn.query(queryAtores,  [ id ]);
                let [buscaGeneros] = await conn.query(queryGeneros,  [ id ]);
    
                let listaAtores = buscaAtores.map((item)=> item.ator);
                let listaGeneros = buscaGeneros.map((item)=> item.genero);
    
                if (listaAtores.length !== 0 && listaGeneros.length === 0){
                    listaGeneros = 'Sem registros';
                }else if (listaAtores.length === 0 && listaGeneros.length !== 0){
                    listaAtores = 'Sem registros';
                }else if (listaAtores.length === 0 && listaGeneros.length === 0){
                    listaGeneros = 'Sem registros';
                    listaAtores = 'Sem registros';
                };
    
                let objetoFilme = {
                    id: id,
                    titulo: titulo,
                    ano: ano,
                    duracao: duracao,
                    sinopse: sinopse,
                    poster: poster,
                    nota: nota,
                    votos: votos,
                    imdb_id: imdb_id,
                    atores: listaAtores,
                    generos: listaGeneros
                };
                filmes.push(objetoFilme);
            };
    
            return res.status(200).json( filmes );

        }else{throw new Error('Erro: Palavra inválida')}{};

    }catch(erro){
        return res.status(500).json({ message: erro.message });
    };
});

// Rota 05 - GET /generos/:genero
app.get('/generos/:genero', async(req, res)=>{
    const { genero } = req.params;

    try{
        const conn = await conecta();
        
        const queryVerificaRegistro = 
        `   
            SELECT count(*) AS contadorRegistro FROM generos WHERE titulo = ?
        `;

        const [registroEncontrado] = await conn.query(queryVerificaRegistro, [genero]);
        const { contadorRegistro } = registroEncontrado[0];
        
        if (contadorRegistro != 0 ){

            const queryFilmes = 
            `
                SELECT filmes.titulo
                FROM filmes INNER JOIN  filmes_generos
                ON filmes.id = filmes_generos.filme_id
                INNER JOIN generos
                ON filmes_generos.genero_id = generos.id
                WHERE generos.titulo = ?
            `;
    
            const [buscaFilmes]= await conn.query(queryFilmes, [ genero ]);
            const objetoPreenchido = Object.entries(buscaFilmes).length;
    
            if (objetoPreenchido != false){
                return res.status(200).json( buscaFilmes );
            }else{throw new Error('Erro: Busca inválida! Não há filmes registros com este gênero')}{};

        }else{throw new Error('Erro: Gênero inválido')}{};

    }catch(erro){
        return res.status(500).json({ message: erro.message });
    };
});

// Rota 06 - GET /ator/:id
app.get('/ator/:id', async(req, res)=>{
    const { id } = req.params;
    if (id <= 0 ){
        return res.status(404).json({ erro: 'Erro: Id inválido' });
    };   

    try{
        const conn = await conecta();

        const queryAtor =
        `
            SELECT titulo AS ator FROM atores
            WHERE id = ?
        `;

        const queryFilmes = 
        `
            SELECT filmes.titulo AS filme FROM atores
            LEFT JOIN atores_filmes
            ON atores.id = atores_filmes.ator_id
            INNER join filmes
            ON atores_filmes.filme_id = filmes.id  
            WHERE atores.id = ?
        `;

        const [buscaAtor] = await conn.query(queryAtor, [ id ]);
        const [buscaFilmes]= await conn.query(queryFilmes, [ id ]);
        const objetoAtor = Object.entries(buscaAtor).length;
        const objetoFilmes = Object.entries(buscaFilmes).length;

        if (objetoAtor != false && objetoFilmes != false){
            
            const consulta = {
                ator: buscaAtor.map((item)=>item.ator),
                filmes: buscaFilmes.map((item)=>item.filme)
            };

            return res.status(200).json( consulta );

        }else if (objetoAtor == true && objetoFilmes == false){
            throw new Error('Erro: Ator/Atriz sem filmes registrados');         
        }else{
            throw new Error('Erro: Busca inválida');  
        };

    }catch(erro){
        return res.status(500).json({ message: erro.message });
    };

});

// Rota 07 - GET /atores/busca/:palavra
app.get('/atores/busca/:palavra', async(req, res)=>{
    const { palavra } = req.params;

    try{
        const conn = await conecta();

        const queryAtores =
        `
            SELECT id AS idAtor, titulo AS ator FROM atores
            WHERE atores.titulo LIKE CONCAT('%',?, '%')
        `;
        
        const queryFilmes =
        `            
            SELECT atores.id as idAtorFilmes, filmes.titulo AS filmes FROM atores
            INNER JOIN atores_filmes
            ON atores_filmes.ator_id = atores.id
            INNER JOIN filmes
            ON atores_filmes.filme_id = filmes.id
            WHERE atores.titulo LIKE CONCAT('%',?, '%')
        `;

        const [buscaAtores] = await conn.query(queryAtores, [ palavra ]);
        const [buscaFilmes] = await conn.query(queryFilmes, [ palavra ]);
        const objetoAtores = Object.entries(buscaAtores).length;
        const objetoFilmes = Object.entries(buscaFilmes).length;
        
        if (objetoAtores != false && objetoFilmes != false){
            const listaAtorFilmes = buscaAtores.map((itemAtor)=> {
                idAtor = itemAtor.idAtor;
                let atorFilmes = {
                    ator: itemAtor.ator,
                    filmes: buscaFilmes.map((itemFilmes)=> {
                        let idAtorFilmes = itemFilmes.idAtorFilmes;
                        if (idAtorFilmes == idAtor){
                            let filmes = itemFilmes.filmes;
                            return filmes;
                        };
                    }).filter(filme => !(filme == null)),
                }; 
                return atorFilmes;            
            });

            return res.status(200).json( listaAtorFilmes );

        }else if (objetoAtores == true && objetoFilmes == false){
            throw new Error('Erro: Não encontrado registros de ator(es)/atriz(es) vinculados em filmes');  
        }else{
            throw new Error('Erro: Não encontrado');
        };


    }catch(erro){
        return res.status(500).json({ message: erro.message });
    }
});

// Rota 8 - POST /atores
app.post('/atores', async(req, res)=>{
    const { titulo } = req.body;

    try{

        if(titulo.match(/^[a-zA-Z\u00C0-\u017F´]+\s+[a-zA-Z\u00C0-\u017F´]{0,}$/) && titulo.trim().split(' ').length == 2){
                
            const conn = await conecta();

            const queryRegistros = `SELECT count(*) AS contadorRegistro FROM atores WHERE titulo = ?`;
            
            const [verificaRegistro] = await conn.query(queryRegistros, [ titulo ]);
            const { contadorRegistro } = verificaRegistro[0];
    
            if (contadorRegistro === 0){
    
                const sql = 'INSERT INTO atores(titulo) VALUES(?)';
                const [insercao] = await conn.query(sql, [ titulo ]);
                const id = insercao.insertId;
                const objetoInsercao = Object.entries(insercao).length;
    
                if (objetoInsercao != false){
                    
                    return res.status(200).json({ message: `Ator/Atriz cadastrado com id ${id}` });
                }else{ throw new Error('Inserção inválida') }{};
    
            }else{ throw new Error('Este registro já existe') }{};
    
        }else{ throw new Error('Nome inválido') }{};

    }catch(erro){
        return res.status(500).json({ message: erro.message });
    };

});

// Rota 9 - PUT /atores
app.put('/atores', async(req, res)=>{
    const { id, titulo } = req.body;

    try{
        if(titulo.match(/^[a-zA-Z\u00C0-\u017F´]+\s+[a-zA-Z\u00C0-\u017F´]{0,}$/) && titulo.trim().split(' ').length == 2){
            const conn = await conecta();

            const queryVerificaRegistroNome = `SELECT count(*) AS contadorRegistroNome FROM atores WHERE titulo = ?`;
    
            const [registroEncontradoNome] = await conn.query(queryVerificaRegistroNome, [titulo]);
            const { contadorRegistroNome } = registroEncontradoNome[0];
    
            if (contadorRegistroNome === 0 ){
                const queryVerificaRegistroId = 'SELECT count(*) AS contadorRegistroId FROM atores WHERE id = ?';
    
                const [registroEncontradoId] = await conn.query(queryVerificaRegistroId, [id]);
                const { contadorRegistroId } = registroEncontradoId[0];
                
                if (contadorRegistroId !== 0){
                    
                    const sqlAtualizar = 'UPDATE atores SET titulo=? WHERE id=?';
        
                    const [registroAtualizado] = await conn.query(sqlAtualizar, [titulo, id]);
                    const objetoAtualizacao = Object.entries(registroAtualizado).length;
            
                    if (objetoAtualizacao != false){
            
                        return res.status(200).json({ message: `Modificado com sucesso o id ${id}` });
                    
                    }else{ throw new Error('Atualização Inválida') }{};
                    
                }else{ throw new Error('Id inválido') }{};
    
            }else{ throw new Error('Já existe um registro com este mesmo nome') }{};

        }else{ throw new Error('Nome inválido') }{};

    }catch(erro){
        return res.status(500).json({ message: erro.message })
    };
});

// Rota 10 - DELETE /atores/:id
app.delete('/atores/:id', async(req, res)=>{
    const { id } = req.params;

    try{
        const conn = await conecta();
        const sqlDeleteEmAtores = 
        `
            DELETE atores.*
            FROM atores
            WHERE atores.id = ?
        `;
        const [remocaoEmAtores] = await conn.query(sqlDeleteEmAtores, [id]);
        const linhasRemovidasAtores = remocaoEmAtores.affectedRows;
        if (linhasRemovidasAtores > 0){

            const sqlDeleteEmAtoresFilmes =
            `          
                DELETE atores_filmes.*
                FROM atores_filmes
                WHERE atores_filmes.ator_id = ?
            `;

            const [remocaoEmAtoresFilmes] = await conn.query(sqlDeleteEmAtoresFilmes, [id]);
            const linhasRemovidasAtoresFilmes = remocaoEmAtoresFilmes.affectedRows;

            if(linhasRemovidasAtoresFilmes > 0){
                return res.status(200).json({ message: `Removido id ${id} em registro de atores e vínculo em filmes` });
            }else{
                return res.status(200).json({ message: `Removido id ${id} em registro de atores` });
            }
            
        }else{ throw new Error(`id ${id} inválido`) }{};

    }catch(erro){
        return res.status(500).json( {message: erro.message} );
    };
});

// Rota 11 - POST /participacoes/:idAtor/:idFilme
app.post('/participacoes/:idAtor/:idFilme', async(req, res)=>{
    const { idAtor, idFilme } = req.params;

    try{
        
        const conn = await conecta();

        const queryVerificaRegistro = 
        `   
            SELECT count(*) AS contadorRegistro FROM atores_filmes 
            WHERE ator_id = ? AND filme_id = ?
        `;

        const [registroEncontrado] = await conn.query(queryVerificaRegistro, [idAtor, idFilme]);
        const { contadorRegistro} = registroEncontrado[0];
        
        if (contadorRegistro === 0){

            const sqlInserte = `INSERT INTO atores_filmes(ator_id, filme_id)VALUES(?,?)`;

            const [registroInserido] = await conn.query(sqlInserte, [idAtor, idFilme]);
            const linhasInseridas = registroInserido.affectedRows;
            const idNovoRegistro = registroInserido.insertId;

            if (linhasInseridas > 0){
                return res.status(200).json({ message: `Registrado cadastrado com id ${idNovoRegistro}` });
            }else{ throw new Error('Inserção inválida') }{};                

        }else{ throw new Error('Este registro já existe') }{};

    }catch(erro){
        return res.status(500).json({ message: erro.message });
    };
});

// Rota 12 - DELETE /participacoes/:idAtor/:idFilme
app.delete('/participacoes/:idAtor/:idFilme', async(req, res)=>{
    const { idAtor, idFilme } = req.params;

    try{
        
        const conn = await conecta();

        const queryVerificaRegistro = 
        `   
            SELECT count(*) AS contadorRegistro, atores_filmes.id FROM atores_filmes 
            WHERE ator_id = ? AND filme_id = ?
        `;

        const [registroEncontrado] = await conn.query(queryVerificaRegistro, [idAtor, idFilme]);
        const { contadorRegistro, id } = registroEncontrado[0];
        
        if (contadorRegistro !== 0){

            const sqlRemocao = 
            `
                DELETE atores_filmes.*
                FROM atores_filmes
                WHERE atores_filmes.ator_id = ? AND filme_id = ?
            `;

            const [registroRemovido] = await conn.query(sqlRemocao, [idAtor, idFilme]);
            const linhasRemovidas = registroRemovido.affectedRows;

            if (linhasRemovidas > 0){
                return res.status(200).json({ message: `Removido registro com id ${id}` });
            }else{ throw new Error('Remoção inválida') }{};                

        }else{ throw new Error('Registro não encontrado') }{};

    }catch(erro){
        return res.status(500).json({ message: erro.message });
    };
});