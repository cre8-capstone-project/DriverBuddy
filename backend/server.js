import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Welcome to DriveBuddy!');
});

app.listen(3000, () => console.log('Example app is listening on port 3000.'));
