import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react'; // ✅ Usa React en lugar de Vue

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/main.jsx', // ✅ Asegúrate que este sea el archivo principal de React
            ],
            refresh: true,
        }),
        react(), // ✅ Usa el plugin correcto
    ],
    build: {
    outDir: 'public/build',
    emptyOutDir: true, // (opcional: limpia la carpeta antes de construir)
},
    server: {
    host: 'atalanta.com',
    port: 5173,
    cors: true,
    origin: 'http://atalanta.com:5173',
  }
});
