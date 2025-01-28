import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts'], //aonde está meus arquivos que quero fazer a build
  clean: true, //limpar o diretorio de build quando eu executo o comando build
  format: 'esm',
  outDir: 'dist',
})
