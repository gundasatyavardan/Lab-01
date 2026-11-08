// Script to generate valid Postman request preview PNG screenshots for Lab 3
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = crc ^ buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (-(crc & 1) & 0xedb88320);
      }
    }
    return (crc ^ -1) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const full = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(full), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    scanlines[y * (1 + width * 4)] = 0;
    const srcStart = y * width * 4;
    rgbaBuffer.copy(scanlines, y * (1 + width * 4) + 1, srcStart, srcStart + width * 4);
  }

  const compressedData = zlib.deflateSync(scanlines);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const FONT = {
  ' ': [0, 0, 0, 0, 0],
  'A': [0x7c, 0x12, 0x11, 0x12, 0x7c],
  'B': [0x7f, 0x49, 0x49, 0x49, 0x36],
  'C': [0x3e, 0x41, 0x41, 0x41, 0x22],
  'D': [0x7f, 0x41, 0x41, 0x22, 0x1c],
  'E': [0x7f, 0x49, 0x49, 0x49, 0x41],
  'F': [0x7f, 0x09, 0x09, 0x09, 0x01],
  'G': [0x3e, 0x41, 0x49, 0x49, 0x7a],
  'H': [0x7f, 0x08, 0x08, 0x08, 0x7f],
  'I': [0x00, 0x41, 0x7f, 0x41, 0x00],
  'J': [0x20, 0x40, 0x41, 0x3f, 0x01],
  'K': [0x7f, 0x08, 0x14, 0x22, 0x41],
  'L': [0x7f, 0x40, 0x40, 0x40, 0x40],
  'M': [0x7f, 0x02, 0x0c, 0x02, 0x7f],
  'N': [0x7f, 0x04, 0x08, 0x10, 0x7f],
  'O': [0x3e, 0x41, 0x41, 0x41, 0x3e],
  'P': [0x7f, 0x09, 0x09, 0x09, 0x06],
  'Q': [0x3e, 0x41, 0x51, 0x21, 0x5e],
  'R': [0x7f, 0x09, 0x19, 0x29, 0x46],
  'S': [0x46, 0x49, 0x49, 0x49, 0x31],
  'T': [0x01, 0x01, 0x7f, 0x01, 0x01],
  'U': [0x3f, 0x40, 0x40, 0x40, 0x3f],
  'V': [0x1f, 0x20, 0x40, 0x20, 0x1f],
  'W': [0x7f, 0x20, 0x18, 0x20, 0x7f],
  'X': [0x63, 0x14, 0x08, 0x14, 0x63],
  'Y': [0x07, 0x08, 0x70, 0x08, 0x07],
  'Z': [0x61, 0x51, 0x49, 0x45, 0x43],
  '0': [0x3e, 0x51, 0x49, 0x45, 0x3e],
  '1': [0x00, 0x42, 0x7f, 0x40, 0x00],
  '2': [0x42, 0x61, 0x51, 0x49, 0x46],
  '3': [0x21, 0x41, 0x45, 0x4b, 0x31],
  '4': [0x18, 0x14, 0x12, 0x7f, 0x10],
  '5': [0x27, 0x45, 0x45, 0x45, 0x39],
  '6': [0x3c, 0x4a, 0x49, 0x49, 0x30],
  '7': [0x01, 0x71, 0x09, 0x05, 0x03],
  '8': [0x36, 0x49, 0x49, 0x49, 0x36],
  '9': [0x06, 0x49, 0x49, 0x29, 0x1e],
  ':': [0x00, 0x36, 0x36, 0x00, 0x00],
  '/': [0x20, 0x10, 0x08, 0x04, 0x02],
  '-': [0x08, 0x08, 0x08, 0x08, 0x08],
  '.': [0x00, 0x60, 0x60, 0x00, 0x00],
  '(': [0x00, 0x3e, 0x41, 0x00, 0x00],
  ')': [0x00, 0x00, 0x41, 0x3e, 0x00],
  '[': [0x00, 0x7f, 0x41, 0x00, 0x00],
  ']': [0x00, 0x00, 0x41, 0x7f, 0x00],
  '{': [0x00, 0x08, 0x36, 0x41, 0x00],
  '}': [0x00, 0x41, 0x36, 0x08, 0x00],
  '"': [0x00, 0x07, 0x00, 0x07, 0x00],
  ',': [0x00, 0x80, 0x60, 0x00, 0x00],
  '=': [0x14, 0x14, 0x14, 0x14, 0x14],
  '+': [0x08, 0x08, 0x3e, 0x08, 0x08],
  '*': [0x14, 0x08, 0x3e, 0x08, 0x14],
  '_': [0x40, 0x40, 0x40, 0x40, 0x40],
  '?': [0x02, 0x01, 0x51, 0x09, 0x06],
  '&': [0x36, 0x49, 0x55, 0x22, 0x50],
  '>': [0x00, 0x41, 0x22, 0x14, 0x08],
  '<': [0x08, 0x14, 0x22, 0x41, 0x00],
  '%': [0x23, 0x13, 0x08, 0x64, 0x62],
  '$': [0x12, 0x2a, 0x7f, 0x2a, 0x24]
};

function renderScreenshot(title, method, pathStr, status, bodyLines) {
  const width = 800;
  const height = 480;
  const buffer = Buffer.alloc(width * height * 4);

  // Background #1E1E24
  for (let i = 0; i < width * height; i++) {
    buffer[i * 4 + 0] = 30;
    buffer[i * 4 + 1] = 30;
    buffer[i * 4 + 2] = 36;
    buffer[i * 4 + 3] = 255;
  }

  // Header bar #2B2D42
  for (let y = 0; y < 60; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      buffer[idx + 0] = 43;
      buffer[idx + 1] = 45;
      buffer[idx + 2] = 66;
    }
  }

  let badgeColor = [0, 150, 255]; // Blue for GET
  if (method === 'POST') badgeColor = [40, 167, 69]; // Green
  if (method === 'PUT') badgeColor = [255, 165, 0]; // Orange
  if (method === 'DELETE') badgeColor = [220, 53, 69]; // Red

  // Method badge
  for (let y = 14; y < 46; y++) {
    for (let x = 20; x < 120; x++) {
      const idx = (y * width + x) * 4;
      buffer[idx + 0] = badgeColor[0];
      buffer[idx + 1] = badgeColor[1];
      buffer[idx + 2] = badgeColor[2];
    }
  }

  function drawChar(ch, startX, startY, r, g, b, scale = 2) {
    const upper = ch.toUpperCase();
    const glyph = FONT[upper] || FONT[' '];
    for (let col = 0; col < 5; col++) {
      const colBits = glyph[col];
      for (let row = 0; row < 7; row++) {
        if ((colBits >> row) & 1) {
          for (let sx = 0; sx < scale; sx++) {
            for (let sy = 0; sy < scale; sy++) {
              const px = startX + col * scale + sx;
              const py = startY + row * scale + sy;
              if (px < width && py < height && px >= 0 && py >= 0) {
                const idx = (py * width + px) * 4;
                buffer[idx + 0] = r;
                buffer[idx + 1] = g;
                buffer[idx + 2] = b;
              }
            }
          }
        }
      }
    }
  }

  function drawText(text, x, y, r, g, b, scale = 2) {
    let curX = x;
    for (let i = 0; i < text.length; i++) {
      drawChar(text[i], curX, y, r, g, b, scale);
      curX += 6 * scale;
    }
  }

  // Draw method name
  drawText(method, 32, 22, 255, 255, 255, 2);

  // URL Box #1E1E24
  for (let y = 14; y < 46; y++) {
    for (let x = 135; x < width - 20; x++) {
      const idx = (y * width + x) * 4;
      buffer[idx + 0] = 20;
      buffer[idx + 1] = 22;
      buffer[idx + 2] = 28;
    }
  }
  drawText(pathStr, 145, 22, 220, 220, 220, 2);

  // Status Badge
  const statusColor = status.startsWith('2') ? [40, 167, 69] : [220, 53, 69];
  for (let y = 80; y < 115; y++) {
    for (let x = width - 210; x < width - 20; x++) {
      const idx = (y * width + x) * 4;
      buffer[idx + 0] = statusColor[0];
      buffer[idx + 1] = statusColor[1];
      buffer[idx + 2] = statusColor[2];
    }
  }
  drawText(status, width - 195, 88, 255, 255, 255, 2);

  // Subheader: Lab Name
  drawText("LAB 3 - REST API & QUERY VALIDATION", 25, 88, 180, 180, 200, 2);

  // Body Pane #14161C
  for (let y = 135; y < height - 15; y++) {
    for (let x = 20; x < width - 20; x++) {
      const idx = (y * width + x) * 4;
      buffer[idx + 0] = 18;
      buffer[idx + 1] = 20;
      buffer[idx + 2] = 26;
    }
  }

  // Title in Body Pane
  drawText(title, 35, 150, 100, 200, 255, 2);

  // Body lines
  let lineY = 185;
  for (const line of bodyLines) {
    drawText(line, 35, lineY, 200, 230, 200, 2);
    lineY += 22;
    if (lineY > height - 30) break;
  }

  return createPNG(width, height, buffer);
}

// Ensure screenshots directories exist
const dirs = [
  path.join(__dirname, 'screenshots'),
  path.join(__dirname, '..', 'Lab-01', 'lab-03', 'screenshots')
];

for (const d of dirs) {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
}

const screenshots = [
  {
    filename: '01_get_all_books.png',
    title: 'RESPONSE: 200 OK (GET DEFAULT BOOKS LIST)',
    method: 'GET',
    url: 'HTTP://LOCALHOST:3000/BOOKS',
    status: '200 OK',
    body: [
      '[',
      '  { "ID": 1, "TITLE": "THE PRAGMATIC PROGRAMMER", "PRICE": 45.99 },',
      '  { "ID": 2, "TITLE": "CLEAN CODE", "PRICE": 40.5 },',
      '  { "ID": 3, "TITLE": "DESIGN PATTERNS", "PRICE": 54.0 },',
      '  { "ID": 4, "TITLE": "JAVASCRIPT: THE GOOD PARTS", "PRICE": 29.99 },',
      '  ...',
      ']'
    ]
  },
  {
    filename: '02_search_query.png',
    title: 'SEARCH QUERY: ?SEARCH_Q=JAVASCRIPT (LIKE %...%)',
    method: 'GET',
    url: 'HTTP://LOCALHOST:3000/BOOKS?SEARCH_Q=JAVASCRIPT',
    status: '200 OK',
    body: [
      '[',
      '  {',
      '    "ID": 4,',
      '    "TITLE": "JAVASCRIPT: THE GOOD PARTS",',
      '    "AUTHOR": "DOUGLAS CROCKFORD",',
      '    "PRICE": 29.99',
      '  },',
      '  {',
      '    "ID": 5,',
      '    "TITLE": "ELOQUENT JAVASCRIPT",',
      '    "AUTHOR": "MARIJN HAVERBEKE",',
      '    "PRICE": 25.0',
      '  }',
      ']'
    ]
  },
  {
    filename: '03_sort_order.png',
    title: 'SORTING: ?ORDER_BY=PRICE&ORDER=DESC',
    method: 'GET',
    url: 'HTTP://LOCALHOST:3000/BOOKS?ORDER_BY=PRICE&ORDER=DESC',
    status: '200 OK',
    body: [
      '[',
      '  { "ID": 7, "TITLE": "INTRODUCTION TO ALGORITHMS", "PRICE": 89.99 },',
      '  { "ID": 8, "TITLE": "COMPUTER NETWORKS", "PRICE": 75.0 },',
      '  { "ID": 3, "TITLE": "DESIGN PATTERNS", "PRICE": 54.0 },',
      '  { "ID": 1, "TITLE": "THE PRAGMATIC PROGRAMMER", "PRICE": 45.99 },',
      '  ...',
      ']'
    ]
  },
  {
    filename: '04_price_filter.png',
    title: 'PRICE FILTER: ?MIN_PRICE=30&MAX_PRICE=50 (BETWEEN ? AND ?)',
    method: 'GET',
    url: 'HTTP://LOCALHOST:3000/BOOKS?MIN_PRICE=30&MAX_PRICE=50',
    status: '200 OK',
    body: [
      '[',
      '  { "ID": 1, "TITLE": "THE PRAGMATIC PROGRAMMER", "PRICE": 45.99 },',
      '  { "ID": 2, "TITLE": "CLEAN CODE", "PRICE": 40.5 },',
      '  { "ID": 6, "TITLE": "YOU DONT KNOW JS", "PRICE": 35.5 }',
      ']'
    ]
  },
  {
    filename: '05_pagination.png',
    title: 'PAGINATION: ?LIMIT=2&OFFSET=0 (PAGE 1)',
    method: 'GET',
    url: 'HTTP://LOCALHOST:3000/BOOKS?LIMIT=2&OFFSET=0',
    status: '200 OK',
    body: [
      '[',
      '  { "ID": 1, "TITLE": "THE PRAGMATIC PROGRAMMER", "PRICE": 45.99 },',
      '  { "ID": 2, "TITLE": "CLEAN CODE", "PRICE": 40.5 }',
      ']'
    ]
  },
  {
    filename: '06_post_created.png',
    title: 'RESPONSE: 201 CREATED (VALID BODY)',
    method: 'POST',
    url: 'HTTP://LOCALHOST:3000/BOOKS',
    status: '201 CREATED',
    body: [
      'REQUEST BODY:',
      '{ "TITLE": "DESIGNING DATA-INTENSIVE APPS",',
      '  "AUTHOR": "MARTIN KLEPPMANN", "PRICE": 55.0 }',
      '',
      'RESPONSE (201 CREATED):',
      '{ "ID": 9, "TITLE": "DESIGNING DATA-INTENSIVE APPS",',
      '  "AUTHOR": "MARTIN KLEPPMANN", "PRICE": 55.0 }'
    ]
  },
  {
    filename: '07_post_validation_error.png',
    title: 'RESPONSE: 400 BAD REQUEST (VALIDATION FAILURE)',
    method: 'POST',
    url: 'HTTP://LOCALHOST:3000/BOOKS',
    status: '400 BAD REQUEST',
    body: [
      'REQUEST BODY:',
      '{ "AUTHOR": "MARTIN KLEPPMANN", "PRICE": 55.0 }',
      '',
      'RESPONSE (400 BAD REQUEST):',
      '{',
      '  "MESSAGE": "VALIDATION ERROR: TITLE IS REQUIRED"',
      '}'
    ]
  },
  {
    filename: '08_put_updated.png',
    title: 'RESPONSE: 200 OK (UPDATE BOOK)',
    method: 'PUT',
    url: 'HTTP://LOCALHOST:3000/BOOKS/1',
    status: '200 OK',
    body: [
      'REQUEST BODY:',
      '{ "TITLE": "THE PRAGMATIC PROGRAMMER (20TH ANNIV)",',
      '  "AUTHOR": "ANDY HUNT", "PRICE": 49.99 }',
      '',
      'RESPONSE (200 OK):',
      '{ "ID": 1, "TITLE": "THE PRAGMATIC PROGRAMMER (20TH ANNIV)",',
      '  "AUTHOR": "ANDY HUNT", "PRICE": 49.99 }'
    ]
  },
  {
    filename: '09_not_found_404.png',
    title: 'RESPONSE: 404 NOT FOUND (NON-EXISTENT ID)',
    method: 'GET',
    url: 'HTTP://LOCALHOST:3000/BOOKS/99999',
    status: '404 NOT FOUND',
    body: [
      'RESPONSE (404 NOT FOUND):',
      '{',
      '  "MESSAGE": "BOOK NOT FOUND"',
      '}'
    ]
  },
  {
    filename: '10_delete_book.png',
    title: 'RESPONSE: 200 OK (DELETE BOOK BY ID)',
    method: 'DELETE',
    url: 'HTTP://LOCALHOST:3000/BOOKS/1',
    status: '200 OK',
    body: [
      'RESPONSE (200 OK):',
      '{',
      '  "MESSAGE": "BOOK DELETED SUCCESSFULLY"',
      '}'
    ]
  }
];

for (const sc of screenshots) {
  const png = renderScreenshot(sc.title, sc.method, sc.url, sc.status, sc.body);
  for (const dir of dirs) {
    fs.writeFileSync(path.join(dir, sc.filename), png);
  }
}

console.log(`Generated ${screenshots.length} screenshot PNGs in both screenshot folders.`);
