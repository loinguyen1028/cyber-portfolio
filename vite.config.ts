import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vite Plugin xử lý API POST /api/save-portfolio khi chạy `npm run dev`
function savePortfolioPlugin(): Plugin {
  return {
    name: 'save-portfolio-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/save-portfolio' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (!data || !data.hero || !data.projects) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, message: 'Dữ liệu không đúng định dạng Portfolio!' }));
                return;
              }

              const targetPath = path.resolve(__dirname, 'src/data/defaultPortfolioData.ts');
              const fileContent = `// Dữ liệu mặc định lấy từ CV — sửa nội dung portfolio tại đây\nexport const DEFAULT_PORTFOLIO_DATA = ${JSON.stringify(data, null, 2)};\n`;

              // 1. Ghi đè file TypeScript
              fs.writeFileSync(targetPath, fileContent, 'utf-8');
              console.log(`[Vite API] Đã ghi đè dữ liệu vào: ${targetPath}`);

              // 2. Chạy lệnh Git add & commit
              const gitCmd = 'git add src/data/defaultPortfolioData.ts && git commit -m "Auto-update portfolio data via CMS"';
              exec(gitCmd, { cwd: __dirname }, (error, stdout, stderr) => {
                res.setHeader('Content-Type', 'application/json');
                if (error) {
                  if (stdout.includes('nothing to commit') || stderr.includes('nothing to commit')) {
                    res.statusCode = 200;
                    res.end(
                      JSON.stringify({
                        success: true,
                        message: 'Đã lưu vào defaultPortfolioData.ts (Git: Không có thay đổi mới để commit).',
                        details: stdout || stderr
                      })
                    );
                    return;
                  }

                  res.statusCode = 500;
                  res.end(
                    JSON.stringify({
                      success: false,
                      message: 'Đã lưu file thành công nhưng lỗi khi chạy git commit: ' + (error.message || stderr),
                      details: stderr
                    })
                  );
                  return;
                }

                res.statusCode = 200;
                res.end(
                  JSON.stringify({
                    success: true,
                    message: 'Đã lưu vào defaultPortfolioData.ts và commit Git thành công!',
                    commitOutput: stdout
                  })
                );
              });
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, message: err?.message || 'Lỗi server nội bộ' }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), savePortfolioPlugin()],
  server: { port: 5173, open: true }
});
