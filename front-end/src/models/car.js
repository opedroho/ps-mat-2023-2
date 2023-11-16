import { z } from 'zod';

// Obtém a data atual para ser usada como referência
const maxYearManufacture = new Date();   
maxYearManufacture.setFullYear(maxYearManufacture.getFullYear());

// Define a data mínima para o ano de fabricação como 83 anos antes da data máxima
const minYearManufacture = new Date();
minYearManufacture.setFullYear(maxYearManufacture.getFullYear() - 83);

// Obtém a data atual para ser usada como referência na validação de data de venda
const maxSellingDate = new Date();

// Define o esquema (schema) para o objeto Car usando o Zod
const Car = z.object({
  brand: 
    z.string()
    .min(1, { message: 'A marca deve ter, no mínimo, 1 caracter' })
    .max(25, { message: 'A marca deve ter, no máximo, 25 caracteres' }),
  
  model: 
    z.string()
    .min(1, { message: 'O modelo deve ter, no mínimo, 1 caracter' })
    .max(25, { message: 'O modelo deve ter, no máximo, 25 caracteres' }),

  color: 
    z.string()
    .min(4, { message: 'A cor deve ter, no mínimo, 4 caracteres' })
    .max(20, { message: 'A cor deve ter, no máximo, 20 caracteres' }),

  year_manufacture:
    // Validação para o ano de fabricação
    z.coerce.date()
    .min(minYearManufacture, { message: 'Data de ano de fabricação está muito no passado'})
    .max(maxYearManufacture, { message: 'A data não pode ser maior que o ano atual' })
    .nullable(),

  imported:
    z.boolean(),

  plates:
    // Validação para a placa, removendo underscores e verificando se tem 8 caracteres
    z.string()
    .transform(v => v.replace('_', '')) 
    .refine(v => v.length == 8, { message: 'Algum dígito da placa está incompleto' }),

  selling_date:
    // Validação para a data de venda, não permitindo datas futuras
    z.coerce.date()
    .max(maxSellingDate, { message: 'A data não pode ser maior que o dia atual' })
    .nullable(),

  selling_price:
    // Validação para o preço de venda, não permitindo valores abaixo de 2000
    z.number()
    .max(2000, {message: 'O valor não pode ser abaixo de 2000'})
    .nullable(),

  customer_id:
    // Validação para o ID do cliente, exigindo um valor positivo
    z.number()
    .min(0, {message: 'O valor precisa ser positivo'})
    .nullable()
});

// Exporta o esquema Car
export default Car;
