const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve all static files from the current folder
app.use(express.static(path.join(__dirname, '')));

// For any route, serve the index.html (useful for 404s and single page apps)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
