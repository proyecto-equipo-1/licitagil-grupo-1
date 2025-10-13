/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const multer = require('multer')

// Configure multer for memory storage
const storage = multer.memoryStorage()
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Solo se permiten archivos PDF'), false)
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB max (AWS Lambda límite)
  }
})

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  res.header("Access-Control-Allow-Methods", "*")
  next()
});

// Handle preflight OPTIONS requests
app.options('*', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
  res.sendStatus(200);
});

// Mock data for development - replace with DynamoDB later
let licitaciones = [
  {
    id: 1,
    titulo: "Construcción de Puente",
    descripcion: "Licitación para la construcción de puente vehicular",
    fechaCreacion: "2025-10-01T10:00:00Z",
    fechaCierre: "2025-12-15T23:59:59Z",
    estado: "ABIERTA",
    presupuestoMinimo: 100000,
    presupuestoMaximo: 500000,
    categoria: "Infraestructura",
    organizacion: "Municipalidad Central",
    contactoEmail: "licitaciones@municentral.gov",
    contactoTelefono: "+1234567890",
    ubicacion: "Ciudad Central",
    modalidad: "PRESENCIAL",
    pdfPath: null,
    pdfOriginalName: null,
    pdfData: null
  },
  {
    id: 2,
    titulo: "Suministro de Equipos Médicos",
    descripcion: "Adquisición de equipos médicos para hospital",
    fechaCreacion: "2025-10-05T14:30:00Z",
    fechaCierre: "2025-11-30T18:00:00Z",
    estado: "ABIERTA",
    presupuestoMinimo: 50000,
    presupuestoMaximo: 200000,
    categoria: "Salud",
    organizacion: "Hospital Regional",
    contactoEmail: "compras@hospital.gov",
    contactoTelefono: "+1234567891",
    ubicacion: "Región Norte",
    modalidad: "VIRTUAL",
    pdfPath: null,
    pdfOriginalName: null,
    pdfData: null
  }
];

/**********************
 * LICITACIONES API   *
 **********************/

// GET /api/licitaciones - Listar licitaciones
app.get('/api/licitaciones', function(req, res) {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const state = String(req.query.state || 'Todas').trim();
  const search = String(req.query.search || '').trim();

  let filteredLicitaciones = [...licitaciones];

  // Filtrar por búsqueda
  if (search) {
    filteredLicitaciones = filteredLicitaciones.filter(lic => 
      lic.titulo.toLowerCase().includes(search.toLowerCase()) ||
      lic.descripcion.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Filtrar por estado
  if (state !== 'Todas') {
    filteredLicitaciones = filteredLicitaciones.filter(lic => lic.estado === state);
  }

  // Paginación
  const total = filteredLicitaciones.length;
  const startIndex = (page - 1) * pageSize;
  const items = filteredLicitaciones.slice(startIndex, startIndex + pageSize);

  res.json({ 
    items, 
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  });
});

// GET /api/licitaciones/:id - Obtener una licitación
app.get('/api/licitaciones/:id', function(req, res) {
  const id = Number(req.params.id);
  const licitacion = licitaciones.find(lic => lic.id === id);
  
  if (!licitacion) {
    return res.status(404).json({ error: 'Licitación no encontrada' });
  }
  
  res.json(licitacion);
});

// POST /api/licitaciones - Crear nueva licitación
app.post('/api/licitaciones', upload.single('pdf'), function(req, res) {
  const newId = Math.max(...licitaciones.map(l => l.id), 0) + 1;
  
  const newLicitacion = {
    id: newId,
    titulo: req.body.titulo || '',
    descripcion: req.body.descripcion || '',
    fechaCreacion: new Date().toISOString(),
    fechaCierre: req.body.fechaCierre || req.body.fecha_cierre || '',
    estado: req.body.estado || 'ABIERTA',
    presupuestoMinimo: Number(req.body.presupuestoMinimo) || 0,
    presupuestoMaximo: Number(req.body.presupuestoMaximo) || 0,
    categoria: req.body.categoria || '',
    organizacion: req.body.organizacion || '',
    contactoEmail: req.body.contactoEmail || '',
    contactoTelefono: req.body.contactoTelefono || '',
    ubicacion: req.body.ubicacion || '',
    modalidad: req.body.modalidad || 'PRESENCIAL',
    pdfPath: null,
    pdfOriginalName: null,
    pdfData: null
  };
  
  // Si se subió un archivo PDF
  if (req.file) {
    newLicitacion.pdfData = req.file.buffer.toString('base64');
    newLicitacion.pdfOriginalName = req.file.originalname;
    newLicitacion.pdfPath = `/api/licitaciones/${newId}/pdf`;
  }
  
  licitaciones.push(newLicitacion);
  res.status(201).json(newLicitacion);
});

// PUT /api/licitaciones/:id - Actualizar licitación
app.put('/api/licitaciones/:id', upload.single('pdf'), function(req, res) {
  const id = Number(req.params.id);
  const index = licitaciones.findIndex(lic => lic.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Licitación no encontrada' });
  }
  
  const updatedLicitacion = {
    ...licitaciones[index],
    ...req.body,
    id: id // Preservar el ID
  };
  
  // Si se subió un nuevo archivo PDF
  if (req.file) {
    updatedLicitacion.pdfData = req.file.buffer.toString('base64');
    updatedLicitacion.pdfOriginalName = req.file.originalname;
    updatedLicitacion.pdfPath = `/api/licitaciones/${id}/pdf`;
  }
  
  // Si se solicita eliminar el PDF
  if (req.body.removePdf === '1' || req.body.removePdf === true) {
    updatedLicitacion.pdfData = null;
    updatedLicitacion.pdfOriginalName = null;
    updatedLicitacion.pdfPath = null;
  }
  
  licitaciones[index] = updatedLicitacion;
  res.json(updatedLicitacion);
});

// DELETE /api/licitaciones/:id - Eliminar licitación
app.delete('/api/licitaciones/:id', function(req, res) {
  const id = Number(req.params.id);
  const index = licitaciones.findIndex(lic => lic.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Licitación no encontrada' });
  }
  
  licitaciones.splice(index, 1);
  res.json({ message: 'Licitación eliminada exitosamente' });
});

// GET /api/licitaciones/:id/pdf - Obtener PDF de licitación
app.get('/api/licitaciones/:id/pdf', function(req, res) {
  const id = Number(req.params.id);
  const licitacion = licitaciones.find(lic => lic.id === id);
  
  if (!licitacion) {
    return res.status(404).json({ error: 'Licitación no encontrada' });
  }
  
  if (!licitacion.pdfData) {
    return res.status(404).json({ error: 'PDF no encontrado para esta licitación' });
  }
  
  // Servir el PDF desde memoria
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="${licitacion.pdfOriginalName || 'documento.pdf'}"`
  });
  
  const pdfBuffer = Buffer.from(licitacion.pdfData, 'base64');
  res.send(pdfBuffer);
});

// POST /api/licitaciones/:id/pdf - Subir PDF para licitación
app.post('/api/licitaciones/:id/pdf', upload.single('pdf'), function(req, res) {
  const id = Number(req.params.id);
  const licitacion = licitaciones.find(lic => lic.id === id);
  
  if (!licitacion) {
    return res.status(404).json({ error: 'Licitación no encontrada' });
  }
  
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha subido ningún archivo PDF' });
  }
  
  // Guardar el archivo en memoria como base64
  licitacion.pdfData = req.file.buffer.toString('base64');
  licitacion.pdfOriginalName = req.file.originalname;
  licitacion.pdfPath = `/api/licitaciones/${id}/pdf`;
  
  res.json({ 
    message: 'PDF subido exitosamente',
    pdfPath: licitacion.pdfPath,
    originalName: licitacion.pdfOriginalName,
    size: req.file.size
  });
});

// Health check endpoint
app.get('/api/health', function(req, res) {
  res.json({ 
    status: 'OK', 
    message: 'LicitAgil API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Catch all for debugging
app.get('/api/*', function(req, res) {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    url: req.url,
    method: req.method,
    availableEndpoints: [
      'GET /api/licitaciones',
      'GET /api/licitaciones/:id',
      'POST /api/licitaciones',
      'PUT /api/licitaciones/:id',
      'DELETE /api/licitaciones/:id',
      'GET /api/health'
    ]
  });
});

app.listen(3000, function() {
    console.log("LicitAgil API started on port 3000")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
