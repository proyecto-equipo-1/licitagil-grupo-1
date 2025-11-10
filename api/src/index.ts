import 'dotenv/config';
import app from './app.js';
import { debugPaths } from './utils/paths.js';

const PORT = process.env.PORT || 3000;

// Mostrar información de rutas al iniciar
debugPaths();

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
});
