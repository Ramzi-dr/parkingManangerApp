//this vite config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
//
//https: false,
//key: path.resolve(__dirname, 'ssl', 'react_selfsigned.key'),
//cert: path.resolve(__dirname, 'ssl', 'react_selfsigned.crt'),
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],server: {

// https: true,
// key: path.resolve(__dirname, 'ssl', 'react_selfsigned.key'),
// cert: path.resolve(__dirname, 'ssl', 'react_selfsigned.crt'),

    host: '0.0.0.0',
    port: 8334,  // You can specify the port here if you want to use a custom port
  }
})
