const keys = require("./keys")
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")

// EXPRESS
const app = express()

app.use(cors())
app.use(bodyParser.json())

// POSTGRES
const { Pool } = require("pg")
const pg_client = new Pool({
  user: keys.pg_user,
  host: keys.pg_host,
  database: keys.pg_database,
  password: keys.pg_password,
  port: keys.pg_port,
})

pg_client.on("error", () => console.log("Lost PG connection"))

pg_client
  .query(`CREATE TABLE IF NOT EXISTS values (number INT)`)
  .catch(err => console.log(err))

// REDIS
const redis = require("redis")

const redis_client = redis.createClient({
  host: keys.redis_host,
  port: keys.redis_port,
  retry_strategy: () => 1000,
})

const redis_publisher = redis_client.duplicate()

// ROUTES
app.get("/", (req, res) => {
  res.send("Test!")
})

app.get("/values/all", async (req, res) => {
  const values = await pg_client.query("SELECT * FROM values")
  res.send(values.rows)
})

app.get("/values/current", (req, res) => {
  redis_client.hgetall("values", (err, values) => {
    res.send(values)
  })
})

app.post("/values", async (req, res) => {
  const index = req.body.index

  if (index > 40) {
    return res.status(422).send("Index too high")
  }

  redis_client.hset("values", index, "Nothing yet!")
  redis_publisher.publish("insert", index)

  // SQL INJECTION VULNERABILITY
  pg_client.query(`INSERT INTO values(number) VALUES (${index})`)

  res.send({ working: true })
})

const PORT = 5000
app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
