import prisma from '../database/client.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const controller = {}     // Objeto vazio

controller.create = async function(req, res) {
  try {

    // Criptografa a senha com bcrypt, usando 12 passos
    req.body.password = await bcrypt.hash(req.body.password, 12)

    await prisma.user.create({ data: req.body })

    // HTTP 201: Created
    res.status(201).end()
  }
  catch(error) {
    console.error(error)
    // HTTP 500: Internal Server Error
    res.status(500).send(error)
  }
}

controller.retrieveAll = async function(req, res) {
  try{

    let include = {}    // Por padrão, não inclui nenhum relacionamento

    // Somente vai incluir entidades relacionadas se
    // a querystring "related" for passada na URL
    if(req.query.related) include.customer = true

    const result = await prisma.user.findMany({
      include,
      orderBy: [
        { first_name: 'asc' },
        { last_name: 'asc' }
      ]
    })

    // Deleta o campo "password", para não ser enviado ao front-end
    for(let user of result) {
      if(user.password) delete user.password
    }

    // HTTP 200: OK
    res.send(result)
  }
  catch(error) {
    console.error(error)
    // HTTP 500: Internal Server Error
    res.status(500).send(error)
  }
}

controller.retrieveOne = async function(req, res) {
  try {
    const result = await prisma.user.findUnique({
      where: { id: Number(req.params.id) }
    })

    // Encontrou: retorna HTTP 200: OK
    if(result) {
      // Deleta o campo "password" do resultado
      if(result.password) delete result.password
      res.send(result)
    }
    // Não encontrou: retorna HTTP 404: Not found
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)
    // HTTP 500: Internal Server Error
    res.status(500).send(error)
  }
}

controller.update = async function(req, res) {
  try {
    const result = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })

    // HTTP 204: No content
    if(result) res.status(204).end()
    // HTTP 404: Not found
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)
    // HTTP 500: Internal Server Error
    res.status(500).send(error)
  }
}

controller.delete = async function(req, res) {
  try {
    const result = await prisma.user.delete({
      where: { id: Number(req.params.id) }
    })
    
    // HTTP 204: No Content
    if(result) res.status(204).end()
    // HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    console.error(error)
    // HTTP 500: Internal Server Error
    res.status(500).send(error)
  }
}

controller.login = async function(req, res) {
  try {

    // Busca o usuário pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email: req.body.email }
    })

    // Se o usuário não for encontrado, retorna
    // HTTP 401: Unauthorized
    if(! user) {
      res.clearCookie('_data_')   // Apaga qualquer versão prévia do cookie
      return res.status(401).end()
    }

    // Usuário encontrado, vamos conferir a senha
    const passwordMatches = await bcrypt.compare(req.body.password, user.password)

    if(passwordMatches) {   // A senha confere

      // Apagamos o campo "password" do objeto user
      // antes de incluí-lo no token
      if(user.password) delete user.password

      // Formamos um token de autenticação para ser enviado ao front-end
      const token = jwt.sign(
        user,                       // Os dados do usuário
        process.env.TOKEN_SECRET,   // Chave para criptografar o token
        { expiresIn: '24h' }         // Prazo de validade do token
      )

      // Forma o cookie para retornar ao front-end
      res.cookie('_data_', token, {
        httpOnly: true,       // HTTP only: o cookie ficará inacessível via JS
        secure: true,
        sameSite: 'None',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000  // 24h
      })

      // console.log(token)

      // Retorna HTTP 204: No content
      res.status(204).end()

    }
    else {
      res.clearCookie('_data_')   // Apaga qualquer versão prévia do cookie
      // Senha errada ~> HTTP 401: Unauthorized
      res.status(401).end()
    }

  }
  catch(error) {
    console.error(error)
    // HTTP 500: Internal Server Error
    res.status(500).send(error)
  }
}

controller.logout = function(req, res) {
  // Apaga o cookie que contém o token
  // res.clearCookie('_data_')

  res.cookie('_data_', 'NO USER', {
    httpOnly: true,       // HTTP only: o cookie ficará inacessível via JS
    secure: true,
    sameSite: 'None',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000  // 24h
  })

  // HTTP 204: No content
  res.status(204).end()
}

// Retorna informações sobre o usuário logado, ou 403
// caso não haja usuário logado
controller.loggedin = function(req, res) {
  if(req.loggedInUser) res.send(req.loggedInUser)
  else res.status(403).end()
}

export default controller