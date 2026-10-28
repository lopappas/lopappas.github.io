import {defineConfig} from 'vite';
import {resolve} from 'node:path';
export default defineConfig({root:resolve(process.cwd(),'web'),base:'./',build:{outDir:resolve(process.cwd(),'dist-pages'),emptyOutDir:true}});
