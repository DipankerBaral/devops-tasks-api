const { createApp } = require('./app');

// Port comes from an environment variable so Docker/AWS can configure it.
const PORT = process.env.PORT || 3000;

createApp().listen(PORT, () => {
  console.log(`Tasks API listening on port ${PORT}`);
});
