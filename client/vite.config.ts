import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	define: {
		__BUILD_SHA__: JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev'),
		__BUILD_TIME__: JSON.stringify(new Date().toISOString()),
	},
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:3001',
				changeOrigin: true,
			},
		},
	},
});
