import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Setup temp directory for uploads
const uploadDir = path.join(__dirname, 'temp_uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.wav';
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB
});

app.use(express.json());

// Serve static samples
app.use('/samples', express.static(path.join(__dirname, 'public', 'samples')));
app.use('/api/samples', express.static(path.join(__dirname, 'public', 'samples')));

// Helper to run python CLI runner with clean promise handling
function runPythonCli(args: string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'backend', 'cli_runner.py');
    const pythonCmd = process.env.PYTHON_CMD || (process.platform === 'win32' ? 'python' : 'python3');
    const py = spawn(pythonCmd, [scriptPath, ...args]);
    let stdout = '';
    let stderr = '';

    py.stdout.on('data', (d) => {
      stdout += d.toString();
    });
    py.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    py.on('close', (code) => {
      if (code !== 0) {
        try {
          const errJson = JSON.parse(stdout);
          return reject(new Error(errJson.error || stderr || `Process failed with code ${code}`));
        } catch {
          return reject(new Error(stderr || stdout || `Process exited with code ${code}`));
        }
      }
      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (e: any) {
        reject(new Error(`Failed to parse Python output: ${e.message} — ${stdout}`));
      }
    });
  });
}

// 1. Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'VoxSage AI Audio Signal Processing & Grounding Engine',
    version: '1.0.0',
    pythonBackend: 'Active',
    features: [
      'Contrastive Audio Feature Extraction',
      'F0 Dynamic Pitch Contour Profiling',
      'Dynamic Time Warping (DTW) Alignment',
      'Temporal Flaw Grounding',
      'Acoustic Energy Envelope Dynamics',
      'Benchmark Precision & IoU Evaluation',
    ],
  });
});

// 2. Analyze speech
app.post('/api/analyze', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file provided in "file" form field.' });
  }

  const filePath = req.file.path;
  const transcript = req.body.transcript || 'none';

  try {
    const result = await runPythonCli(['analyze', filePath, transcript]);
    // Cleanup temporary file
    try { fs.unlinkSync(filePath); } catch {}
    res.json(result);
  } catch (err: any) {
    try { fs.unlinkSync(filePath); } catch {}
    res.status(422).json({ error: err.message });
  }
});

// 3. Compare speech (Contrastive comparison)
app.post('/api/compare', upload.fields([
  { name: 'reference', maxCount: 1 },
  { name: 'participant', maxCount: 1 },
]), async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  
  let refPath = files?.['reference']?.[0]?.path;
  let partPath = files?.['participant']?.[0]?.path;

  // Check if sample names were passed instead
  if (!refPath && req.body.referenceSample) {
    const sampleRef = path.join(__dirname, 'public', 'samples', req.body.referenceSample);
    if (fs.existsSync(sampleRef)) {
      refPath = sampleRef;
    }
  }
  if (!partPath && req.body.participantSample) {
    const samplePart = path.join(__dirname, 'public', 'samples', req.body.participantSample);
    if (fs.existsSync(samplePart)) {
      partPath = samplePart;
    }
  }

  if (!refPath || !partPath) {
    return res.status(400).json({
      error: 'Both reference and participant audio files or samples are required.',
    });
  }

  const transcript = req.body.transcript || 'none';

  try {
    const result = await runPythonCli(['compare', refPath, partPath, transcript]);
    // Cleanup temp uploaded files (do not delete sample files)
    if (files?.['reference']?.[0]?.path) {
      try { fs.unlinkSync(files['reference'][0].path); } catch {}
    }
    if (files?.['participant']?.[0]?.path) {
      try { fs.unlinkSync(files['participant'][0].path); } catch {}
    }
    res.json(result);
  } catch (err: any) {
    if (files?.['reference']?.[0]?.path) {
      try { fs.unlinkSync(files['reference'][0].path); } catch {}
    }
    if (files?.['participant']?.[0]?.path) {
      try { fs.unlinkSync(files['participant'][0].path); } catch {}
    }
    res.status(422).json({ error: err.message });
  }
});

// 4. Dataset items
app.get('/api/dataset', (_req, res) => {
  const datasetFile = path.join(__dirname, 'dataset', 'annotations', 'benchmark_pairs.json');
  if (!fs.existsSync(datasetFile)) {
    return res.json([]);
  }
  try {
    const data = JSON.parse(fs.readFileSync(datasetFile, 'utf-8'));
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to read dataset annotations' });
  }
});

// 5. Evaluate benchmark
app.post('/api/evaluate', async (_req, res) => {
  try {
    const result = await runPythonCli(['evaluate']);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VoxSage AI unified server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
