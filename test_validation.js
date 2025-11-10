const http = require('http');

function testValidation() {
  const invalidBooks = [
    {
      title: "",
      author: "Test Author",
      isbn: "1234567890",
      genre: "Fiction",
      publication_year: 2023,
      description: "Test book",
      status: "available"
    },
    {
      title: "Test Book",
      author: "",
      isbn: "1234567890",
      genre: "Fiction",
      publication_year: 2023,
      description: "Test book",
      status: "available"
    },
    {
      title: "Test Book",
      author: "Test Author",
      isbn: "",
      genre: "Fiction",
      publication_year: 2023,
      description: "Test book",
      status: "available"
    },
    {
      title: "Test Book",
      author: "Test Author",
      isbn: "invalid-isbn",
      genre: "Fiction",
      publication_year: 2023,
      description: "Test book",
      status: "available"
    },
    {
      title: "Test Book",
      author: "Test Author",
      isbn: "1234567890",
      genre: "Fiction",
      publication_year: 999,
      description: "Test book",
      status: "available"
    },
    {
      title: "Test Book",
      author: "Test Author",
      isbn: "1234567890",
      genre: "Fiction",
      publication_year: 3000,
      description: "Test book",
      status: "available"
    },
    {
      title: "Test Book",
      author: "Test Author",
      isbn: "1234567890",
      genre: "Fiction",
      publication_year: 2023,
      description: "Test book",
      status: "invalid-status"
    }
  ];

  let completedTests = 0;

  invalidBooks.forEach((book, index) => {
    const postData = JSON.stringify(book);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/books',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      console.log(`Test ${index + 1} - Status: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);

      res.setEncoding('utf8');
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        console.log('Response:', body);
        completedTests++;
        if (completedTests === invalidBooks.length) {
          console.log('All validation tests completed.');
        }
      });
    });

    req.on('error', (e) => {
      console.error(`Problem with request ${index + 1}: ${e.message}`);
      completedTests++;
      if (completedTests === invalidBooks.length) {
        console.log('All validation tests completed.');
      }
    });

    req.write(postData);
    req.end();
  });
}

testValidation();
