import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*== LICITAGIL SCHEMA =====================================================
Schema para el sistema de gestión de licitaciones
- Licitacion: Modelo principal con todos los campos necesarios
- Autorizacion: Permite acceso público para simplificar (desarrollo)
=========================================================================*/
const schema = a.schema({
  Licitacion: a
    .model({
      titulo: a.string().required(),
      descripcion: a.string().required(),
      fechaCreacion: a.datetime().required(),
      fechaLimite: a.datetime().required(),
      estado: a.enum(['ABIERTA', 'CERRADA', 'ADJUDICADA', 'CANCELADA']),
      presupuestoMinimo: a.float(),
      presupuestoMaximo: a.float(),
      categoria: a.string(),
      organizacion: a.string(),
      contactoEmail: a.email(),
      contactoTelefono: a.string(),
      archivoPdf: a.string(), // URL del archivo en S3
      archivoNombreOriginal: a.string(),
      requisitos: a.string(),
      criteriosEvaluacion: a.string(),
      ubicacion: a.string(),
      modalidad: a.enum(['PRESENCIAL', 'VIRTUAL', 'HIBRIDA']),
      moneda: a.string().default('USD'),
      idioma: a.string().default('ES'),
      // Campos de auditoría
      creadoPor: a.string(),
      actualizadoPor: a.string(),
      // Timestamps automáticos
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.guest().to(['create', 'read', 'update', 'delete'])
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'identityPool',
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
