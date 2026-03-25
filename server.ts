import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for BRN Lookup (Proxy to avoid CORS and hide API Key)
  app.post('/api/brn-lookup', async (req, res) => {
    const { brn } = req.body;
    const serviceKey = process.env.VITE_DATA_GO_KR_API_KEY || process.env.DATA_GO_KR_API_KEY;

    console.log('--- Server-side BRN Lookup ---');
    console.log('Target BRN:', brn);
    console.log('Service Key exists:', !!serviceKey);

    if (!serviceKey || serviceKey === 'YOUR_API_KEY_HERE') {
      console.error('API Key is missing on server.');
      return res.status(500).json({ 
        error: 'API_KEY_MISSING',
        message: '현재 자동조회 기능 연결이 완료되지 않아 직접 입력이 필요합니다 (API 키 미설정)' 
      });
    }

    try {
      // Using the Public Data Portal API (NTS Status)
      // Note: This API requires the service key to be passed as a query parameter
      const apiUrl = `https://api.odcloud.kr/api/nts-promst/v1/status?serviceKey=${encodeURIComponent(serviceKey)}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          b_no: [brn.replace(/-/g, '')]
        })
      });

      const status = response.status;
      const data = await response.json();

      console.log('API Response Status:', status);
      console.log('API Response Data:', JSON.stringify(data));

      if (!response.ok) {
        return res.status(status).json({ 
          error: 'API_REQUEST_FAILED',
          message: '사업자 정보를 자동으로 확인할 수 없습니다. 직접 입력해주세요 (API 요청 실패)',
          details: data
        });
      }

      if (data && data.data && data.data.length > 0) {
        const business = data.data[0];
        
        // The status API doesn't return the name (b_nm) in most cases.
        // If it's missing, we inform the user but return the status.
        res.json({
          success: true,
          data: {
            brn: business.b_no,
            status: business.b_stt || '정보 없음',
            taxType: business.tax_type || '',
            businessName: business.b_nm || '', // Might be empty
            startDate: business.start_dt || '', // Might be empty
          },
          raw: data
        });
      } else {
        res.status(404).json({ 
          error: 'NOT_FOUND',
          message: '사업자 정보를 확인할 수 없습니다. 직접 입력해주세요 (결과 없음)',
          raw: data
        });
      }
    } catch (error) {
      console.error('Server-side BRN Lookup Error:', error);
      res.status(500).json({ 
        error: 'SERVER_ERROR',
        message: '사업자 정보를 자동으로 확인할 수 없습니다. 직접 입력해주세요 (서버 에러)',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      console.log('--- End of Server-side BRN Lookup ---');
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
