const express = require('express');
const app = express();

// Define a route
app.get('/', (req, res) => {
  res.send('Hello, DevOps World!');
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
