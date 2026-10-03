import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'pos_store_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface PosDb {
  products: any[];
  orders: any[];
  config: any | null;
  updatedAt: string;
}

function loadDb(): PosDb {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to read pos_store_db.json:', e);
    }
  }
  return { products: [], orders: [], config: null, updatedAt: new Date().toISOString() };
}

function saveDb(db: PosDb) {
  try {
    db.updatedAt = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write pos_store_db.json:', e);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route: Get all sync data for multi-device sync
  app.get('/api/pos/all', (req, res) => {
    const db = loadDb();
    res.json(db);
  });

  // API Route: Save or update product
  app.post('/api/pos/products', (req, res) => {
    const product = req.body;
    if (!product || !product.id) {
      return res.status(400).json({ error: 'Product ID required' });
    }

    const db = loadDb();
    const idx = db.products.findIndex((p: any) => p.id === product.id);
    if (idx >= 0) {
      db.products[idx] = product;
    } else {
      db.products.push(product);
    }

    saveDb(db);
    res.json({ success: true, products: db.products });
  });

  // API Route: Delete product
  app.delete('/api/pos/products/:id', (req, res) => {
    const productId = req.params.id;
    const db = loadDb();
    db.products = db.products.filter((p: any) => p.id !== productId);
    saveDb(db);
    res.json({ success: true, products: db.products });
  });

  // API Route: Save Order
  app.post('/api/pos/orders', (req, res) => {
    const order = req.body;
    if (!order || !order.id) {
      return res.status(400).json({ error: 'Order ID required' });
    }

    const db = loadDb();
    const idx = db.orders.findIndex((o: any) => o.id === order.id);
    if (idx >= 0) {
      db.orders[idx] = order;
    } else {
      db.orders.unshift(order);
    }

    saveDb(db);
    res.json({ success: true, orders: db.orders });
  });

  // API Route: Bulk Sync Products & Orders
  app.post('/api/pos/sync', (req, res) => {
    const { products, orders, config } = req.body;
    const db = loadDb();

    if (Array.isArray(products) && products.length > 0) {
      db.products = products;
    }
    if (Array.isArray(orders) && orders.length > 0) {
      db.orders = orders;
    }
    if (config) {
      db.config = config;
    }

    saveDb(db);
    res.json({ success: true, db });
  });

  // API Route: Save Store Config
  app.post('/api/pos/config', (req, res) => {
    const config = req.body;
    const db = loadDb();
    db.config = config;
    saveDb(db);
    res.json({ success: true, config: db.config });
  });

  // Vite middleware integration in development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
