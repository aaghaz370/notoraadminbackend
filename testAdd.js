import fetch from "node-fetch";

const addBook = async () => {
  const res = await fetch("http://localhost:9090/api/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test Book",
      author: "ChatGPT",
      genre: "Testing",
      rating: 4.9,
      thumbnail: "https://via.placeholder.com/150",
      pdfUrl: "https://example.com/test.pdf",
    }),
  });

  const data = await res.json();
  console.log("Response:", data);
};

addBook();
