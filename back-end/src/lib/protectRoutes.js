import jwt from 'jsonwebtoken'

// As rotas que eventualmente não necessitarem
// de autenticação devem ser colocadas no vetor
// abaixo
const bypassRoutes = [
  { uri: '/user/login', method: 'POST' },
  { uri: '/user', method: 'POST' }
]

export default function (req, res, next) {

  // REMOVER DEPOIS
  //next()
  //return

  // Verifica se a rota da vez é desprotegida
  for(let route of bypassRoutes) {
    // Se a rota estiver no vetor bypassRoutes, deixa continuar
    // sem autenticação
    if(route.uri === req.url && route.method === req.method) {
      next()    // Continua sem autenticação
      return
    }
  }

  console.log({COOKIE: req.cookies})

  // Verifica se o token foi enviado por meio do cookie
  const token = req.cookies['_data_']

  // Se não houver token ~> HTTP 403: Forbidden
  if(! token) {
    // console.log('NÃO AUTORIZADO 1')
    return res.status(403).end()
  }

  // Validando o token
  jwt.verify(token, process.env.TOKEN_SECRET, (error, decoded) => {

    // Token inválido ou expirado ~> HTTP 403: Forbidden
    if(error) {
      // console.log('NÃO AUTORIZADO 2', {error})
      return res.status(403).end()
    }
    
    /*
      Se chegarmos até aqui, o token está OK e temos as informações
      do usuário logado no parâmetro "decoded". Vamos guardar isso
      na request para usar depois
    */
    req.loggedInUser = decoded

    // Continuamos para a próxima função de controller
    next()

  })

}