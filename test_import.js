const http = require('http');

function testImport() {
  const books = [
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "978-0-7432-7356-5",
      genre: "Fiction",
      publication_year: 1925,
      description: "A classic American novel about the Jazz Age."
    },
    {
      title: "1984",
      author: "George Orwell",
      isbn: "978-0-452-28423-4",
      genre: "Dystopian",
      publication_year: 1949,
      description: "A dystopian social science fiction novel."
    }
  ];

  const postData = JSON.stringify({ books });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/books/import',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    res.setEncoding('utf8');
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('Response:', body);
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

testImport();
