function parseJSON(content) {
  let importedBooks = [];
  const data = JSON.parse(content);
  if (Array.isArray(data)) {
    importedBooks = data;
  } else if (data.books && Array.isArray(data.books)) {
    importedBooks = data.books;
  } else {
    throw new Error(
      "Invalid JSON format. Expected an array of books or an object with a 'books' array."
    );
  }
  return importedBooks;
}

function parseCSV(content) {
  const lines = content.split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const book = {};
    headers.forEach((header, index) => {
      book[header] = values[index] ? values[index].trim() : "";
    });
    return book;
  });
}

function parseTXT(content) {
  return content
    .split("\n")
    .map((line) => {
      const parts = line.split("|");
      if (parts.length >= 2) {
        return {
          title: parts[0].trim(),
          author: parts[1].trim(),
          genre: parts[2] ? parts[2].trim() : "",
          isbn: parts[3] ? parts[3].trim() : "",
          publication_year: parts[4] ? parseInt(parts[4].trim()) : null,
          description: parts[5] ? parts[5].trim() : "",
        };
      }
      return null;
    })
    .filter((book) => book !== null);
}

function validateAndAddBooks(importedBooks) {
  let addedCount = 0;
  const books = [];
  importedBooks.forEach((bookData) => {
    if (bookData.title && bookData.author) {
      const newId = Math.max(...books.map((b) => b.id), 0) + 1;
      const book = {
        id: newId,
        title: bookData.title,
        author: bookData.author,
        genre: bookData.genre || "",
        isbn: bookData.isbn || "",
        publication_year: bookData.publication_year || null,
        description: bookData.description || "",
        status: "available",
      };
      books.push(book);
      addedCount++;
    }
  });
  return { addedCount, books };
}

console.log("Testing JSON import:");
try {
  const jsonData = '[{"title":"Test Book","author":"Test Author"}]';
  const books = parseJSON(jsonData);
  const result = validateAndAddBooks(books);
  console.log("Success:", result);
} catch (e) {
  console.log("Error:", e.message);
}

console.log("\nTesting CSV import:");
try {
  const csvData = "title,author,genre\nTest Book,Test Author,Fiction";
  const books = parseCSV(csvData);
  const result = validateAndAddBooks(books);
  console.log("Success:", result);
} catch (e) {
  console.log("Error:", e.message);
}

console.log("\nTesting TXT import:");
try {
  const txtData = "Test Book|Test Author|Fiction|123|2023|Description";
  const books = parseTXT(txtData);
  const result = validateAndAddBooks(books);
  console.log("Success:", result);
} catch (e) {
  console.log("Error:", e.message);
}

console.log("\nTesting invalid JSON:");
try {
  const invalidJson = '{"invalid": "data"}';
  parseJSON(invalidJson);
} catch (e) {
  console.log("Expected error:", e.message);
}

console.log("\nTesting invalid CSV:");
try {
  const invalidCsv = "invalid,csv\nno,headers";
  const books = parseCSV(invalidCsv);
  console.log("Parsed:", books);
} catch (e) {
  console.log("Error:", e.message);
}
