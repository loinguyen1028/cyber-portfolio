import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3001;

// Khởi tạo HTTP Server (hỗ trợ CORS và xử lý lưu Codebase + Git Commit)
const server = http.createServer((req, res) => {
  // Cấu hình CORS để Frontend (Vite port 5173) có thể gọi trực tiếp
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoint: POST /api/save-portfolio
  if (req.url === '/api/save-portfolio' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (!data || !data.hero || !data.projects) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Dữ liệu không đúng định dạng Portfolio!' }));
          return;
        }

        // Tự động tăng version dữ liệu (Data Versioning)
        const currentVer = typeof data.version === 'number' ? data.version : (Number(data.version) || 0);
        data.version = currentVer + 1;

        const targetPath = path.resolve(__dirname, 'src/data/defaultPortfolioData.ts');
        const fileContent = `// Dữ liệu mặc định lấy từ CV — sửa nội dung portfolio tại đây\nexport const DEFAULT_PORTFOLIO_DATA = ${JSON.stringify(data, null, 2)};\n`;

        // 1. Ghi đè file TypeScript
        fs.writeFileSync(targetPath, fileContent, 'utf-8');
        console.log(`[Success] Đã ghi đè dữ liệu (v${data.version}) vào: ${targetPath}`);

        // 2. Chạy lệnh Git add & commit
        const gitCmd = 'git add src/data/defaultPortfolioData.ts && git commit -m "Auto-update portfolio data via CMS"';
        exec(gitCmd, { cwd: __dirname }, (error, stdout, stderr) => {
          if (error) {
            // Trường hợp dữ liệu không thay đổi
            if (stdout.includes('nothing to commit') || stderr.includes('nothing to commit')) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  success: true,
                  version: data.version,
                  message: `Đã lưu vào defaultPortfolioData.ts (v${data.version}) (Git: Không có thay đổi mới để commit).`,
                  details: stdout || stderr
                })
              );
              return;
            }

            console.error(`[Git Error] ${error.message}`);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                success: false,
                message: 'Đã lưu file thành công nhưng lỗi khi chạy git commit: ' + (error.message || stderr),
                details: stderr
              })
            );
            return;
          }

          console.log(`[Git Commit] ${stdout}`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              success: true,
              version: data.version,
              message: `Đã lưu vào defaultPortfolioData.ts (v${data.version}) và commit Git thành công!`,
              commitOutput: stdout
            })
          );
        });
      } catch (err) {
        console.error(`[Server Error] ${err?.message}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: err?.message || 'Lỗi server nội bộ' }));
      }
    });
  } else if (req.url === '/api/git-pull' && req.method === 'POST') {
    // API Endpoint: POST /api/git-pull
    console.log('[Server API] Đang thực thi git pull origin main...');
    exec('git pull origin main', { cwd: __dirname }, (error, stdout, stderr) => {
      res.writeHead(error ? 500 : 200, { 'Content-Type': 'application/json' });
      if (error) {
        console.error(`[Git Pull Error] ${error.message}`);
        res.end(
          JSON.stringify({
            success: false,
            message: 'Lỗi khi chạy git pull: ' + (error.message || stderr),
            details: stderr
          })
        );
        return;
      }

      console.log(`[Git Pull Success] ${stdout}`);
      res.end(
        JSON.stringify({
          success: true,
          message: 'Đã kéo code mới nhất từ Git thành công!',
          output: stdout
        })
      );
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found. Use POST /api/save-portfolio or POST /api/git-pull' }));
  }
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`[Cyber-Portfolio Backend] Server đang chạy tại:`);
  console.log(`>> http://localhost:${PORT}`);
  console.log(`>> POST /api/save-portfolio`);
  console.log(`====================================================`);
});

