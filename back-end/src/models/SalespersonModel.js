import { z } from 'zod';

const SalespersonSchema = z.object({
    user_id: z.number(),
    birth_date: z.date().refine((date) => {
      // Validação: Deve ter entre 18 e 120 anos
      const age = new Date().getFullYear() - new Date(date).getFullYear();
      return age >= 18 && age <= 120;
    }),
    ident_document: z.string(), // Você pode incorporar a validação do Customer aqui se necessário
    salary: z.number().refine((salary) => {
      // Validação: Deve estar entre R$ 1.500,00 e R$ 20.000,00
      return salary >= 1500 && salary <= 20000;
    }),
    phone: z.string(), // Você pode incorporar a validação do Customer aqui se necessário
    date_of_hire: z.date().refine((date) => {
      // Validação: Deve estar entre 01/01/2020 e hoje
      const startDate = new Date('2020-01-01');
      const endDate = new Date();
      return date >= startDate && date <= endDate;
    }),
  });
  