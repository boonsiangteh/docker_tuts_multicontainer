const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const keys = require('./keys');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// POSTGRES CLIENT SETUP
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});
pgClient.on('error', () => console.log('Lost connection to postgres') );
pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch( err => console.log(err));

// REDIS CLIENT SETUP
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

// Route handling
app.get('/', (req, res) => {
  res.send('Hi');
});

// reach into postgres to get all indices
app.get('/values/all', async (req,res) => {
  const values = await pgClient.query('SELECT * FROM values');

  res.send(values.rows);
});

// reach into redis db to get current index and calculated fib number
app.get('/values/current', async (req,res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  })
});

// post index back to server for calculation
app.post('/values', (req,res) => {
  const index = req.body.index;
  if (parseInt(index) > 40) return res.status(422).send('Index too high');

  // set hash of values to index and publish it
  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);

  // insert index into postgres for record keeping
  pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);

  res.send({working: true});
});

app.listen(5000, err => {
  console.log("Lisetning on 5000");
})
