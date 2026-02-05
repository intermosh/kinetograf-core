const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5500;

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// COOP/COEP headers for SharedArrayBuffer support
const ISOLATION_HEADERS = {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'credentialless',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
};

const server = http.createServer((req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    
    // Special test endpoint to verify headers
    if (req.url === '/test-headers') {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            ...ISOLATION_HEADERS
        });
        res.end(JSON.stringify({
            message: 'Headers are being sent!',
            headers: ISOLATION_HEADERS
        }, null, 2));
        return;
    }
    
    // Default to index.html
    let filePath = req.url === '/' ? '/index.html' : req.url;
    // Remove query strings
    filePath = filePath.split('?')[0];
    filePath = path.join(__dirname, filePath);
    
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.log(`  → 404 Not Found: ${filePath}`);
                res.writeHead(404, ISOLATION_HEADERS);
                res.end('File not found');
            } else {
                console.log(`  → 500 Error: ${err.code}`);
                res.writeHead(500, ISOLATION_HEADERS);
                res.end('Server error: ' + err.code);
            }
            return;
        }
        
        const headers = {
            'Content-Type': contentType,
            ...ISOLATION_HEADERS
        };
        
        console.log(`  → 200 OK (${contentType})`);
        console.log(`  → COOP: ${headers['Cross-Origin-Opener-Policy']}`);
        console.log(`  → COEP: ${headers['Cross-Origin-Embedder-Policy']}`);
        
        res.writeHead(200, headers);
        res.end(content);
    });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         GESTURE SYNTHESIZER SERVER                            ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Server running at: http://127.0.0.1:${PORT}                    ║
║                                                               ║
║  Headers being sent:                                          ║
║  ✓ Cross-Origin-Opener-Policy: same-origin                    ║
║  ✓ Cross-Origin-Embedder-Policy: credentialless               ║
║                                                               ║
║  IMPORTANT:                                                   ║
║  1. Use http://127.0.0.1:${PORT} (not localhost)                ║
║  2. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)        ║
║  3. Or try incognito/private browsing mode                    ║
║                                                               ║
║  Test headers: http://127.0.0.1:${PORT}/test-headers            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);
});
