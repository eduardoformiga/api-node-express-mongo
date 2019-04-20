const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

require('./app/controllers/index')(app);

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Starting express on port 3000');
});
