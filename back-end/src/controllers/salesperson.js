import prisma from '../database/client.js'

import SalespersonModel from '../models/SalespersonModel.js';

const controller = {}     // Objeto vazio

controller.create = async function(req, res) {
  try {
     // Validar os dados usando o modelo
     const salespersonData = SalespersonModel.parse(req.body);

     // Criar um novo vendedor no banco de dados
     await prisma.salesperson.create({ data: salespersonData });
 
     // HTTP 201: Created
     res.status(201).end();
   } catch (error) {
     console.error(error);
 
     // HTTP 400: Bad Request (devido à validação)
     res.status(400).send(error.errors);
   }
 };

controller.retrieveAll = async function(req, res) {
  try {
    let include = {}    // Por padrão, não inclui nenhum relacionamento

    // Somente vai incluir entidades relacionadas se
    // a querystring "related" for passada na URL
    if(req.query.related) include.user = true

    const result = await prisma.salesperson.findMany({
      include,
      orderBy: [
        { birth_date: 'asc' },
        { ident_document: 'asc' }
      ]
    })

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
    const result = await prisma.salesperson.findUnique({
      where: { id: Number(req.params.id) }
    })

    // Encontrou: retorna HTTP 200: OK
    if(result) res.send(result)
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
    const result = await prisma.salesperson.update({
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
    const result = await prisma.salesperson.delete({
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

export default controller
