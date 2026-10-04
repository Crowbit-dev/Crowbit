import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Commit this build was made from ('dev' outside hosting), plus whether the
// working tree had uncommitted changes — a dirty tree means the bytes match no
// commit, so the client must never report itself as matching.
const buildSha = process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev';
const buildDirty = (() => {
	if (buildSha === 'dev') return false;
	try {
		return execSync('git status --porcelain', { encoding: 'utf8' }).trim().length > 0;
	} catch {
		return false;
	}
})();

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	define: {
		__BUILD_SHA__: JSON.stringify(buildSha),
		__BUILD_TIME__: JSON.stringify(new Date().toISOString()),
		__BUILD_DIRTY__: JSON.stringify(buildDirty),
	},
	build: {
		sourcemap: true,
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
