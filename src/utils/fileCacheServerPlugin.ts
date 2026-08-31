import type { Plugin, ViteDevServer } from 'vite';
import fs from 'fs';
import path from 'path';

export function fileCacheServerPlugin(): Plugin {
  return {
    name: 'vite-plugin-file-cache-storage',
    configureServer(server: ViteDevServer) {
      const dataDir = path.resolve(process.cwd(), 'data');
      const cacheFilePath = path.join(dataDir, 'hospital_cache.json');
      const backupFilePath = path.join(dataDir, 'hospital_cache.backup.json');

      // Ensure data directory exists
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Helper to parse JSON body from incoming requests
      const parseJsonBody = (req: any): Promise<any> => {
        return new Promise((resolve, reject) => {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              if (!body) {
                resolve({});
              } else {
                resolve(JSON.parse(body));
              }
            } catch (err) {
              reject(err);
            }
          });
          req.on('error', (err: any) => reject(err));
        });
      };

      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        // Status check
        if (url === '/api/cache/status' && req.method === 'GET') {
          try {
            const exists = fs.existsSync(cacheFilePath);
            let stats: any = null;
            if (exists) {
              const fileStats = fs.statSync(cacheFilePath);
              stats = {
                sizeBytes: fileStats.size,
                lastModified: fileStats.mtime.toISOString(),
                filePath: cacheFilePath
              };
            }
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({
              status: 'online',
              cacheFileExists: exists,
              stats
            }));
            return;
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
        }

        // Load Cache from disk
        if (url === '/api/cache/load' && req.method === 'GET') {
          try {
            if (!fs.existsSync(cacheFilePath)) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ exists: false, data: null }));
              return;
            }

            const raw = fs.readFileSync(cacheFilePath, 'utf-8');
            const data = JSON.parse(raw);
            const fileStats = fs.statSync(cacheFilePath);

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({
              exists: true,
              lastModified: fileStats.mtime.toISOString(),
              sizeBytes: fileStats.size,
              data
            }));
            return;
          } catch (err: any) {
            console.error('[FileCacheStorage] Error reading cache file:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message, exists: false }));
            return;
          }
        }

        // Sync (Write) Cache to disk
        if (url === '/api/cache/sync' && req.method === 'POST') {
          try {
            const payload = await parseJsonBody(req);
            if (!payload || !payload.data) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing cache data payload' }));
              return;
            }

            const jsonData = JSON.stringify(payload.data, null, 2);

            // Write backup first if main file exists
            if (fs.existsSync(cacheFilePath)) {
              try {
                fs.copyFileSync(cacheFilePath, backupFilePath);
              } catch {
                // Ignore backup copy error
              }
            }

            // Write new data atomically via temp file
            const tempFile = `${cacheFilePath}.tmp.${Date.now()}`;
            fs.writeFileSync(tempFile, jsonData, 'utf-8');
            fs.renameSync(tempFile, cacheFilePath);

            const fileStats = fs.statSync(cacheFilePath);

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              sizeBytes: fileStats.size,
              lastSaved: fileStats.mtime.toISOString(),
              filePath: cacheFilePath
            }));
            return;
          } catch (err: any) {
            console.error('[FileCacheStorage] Error saving cache to disk:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message, success: false }));
            return;
          }
        }

        // Reset / Clear cache
        if (url === '/api/cache/reset' && req.method === 'POST') {
          try {
            if (fs.existsSync(cacheFilePath)) {
              fs.unlinkSync(cacheFilePath);
            }
            if (fs.existsSync(backupFilePath)) {
              fs.unlinkSync(backupFilePath);
            }
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, message: 'Cache reset successfully' }));
            return;
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message, success: false }));
            return;
          }
        }

        next();
      });
    }
  };
}
