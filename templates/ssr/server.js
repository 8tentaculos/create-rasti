import app from './app.js';

const port = process.env.PORT || 5173;

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
