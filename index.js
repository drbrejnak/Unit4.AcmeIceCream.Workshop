const pg = require('pg')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://postgres:DAN0NOAH1@localhost/acme_ice_cream_db')
const express = require('express')
const app = express()

app.use(express.json())

app.use(require('morgan')('dev'))

app.post('/api/flavors', async (req, res, next) => {
  try {
    const SQL = `
      INSERT INTO flavors(name, is_favorite)
      VALUES($1, $2)
      RETURNING *
    `
    const response = await client.query(SQL, [req.body.name, req.body.is_favorite])
    res.send(response.rows[0])
  } catch (ex) {
    next(ex)
  }
})

app.get('/api/flavors', async (req, res, next) => {
  try {
    const SQL = `
      SELECT * from flavors ORDER BY created_at DESC;
    `
    const response = await client.query(SQL)
    res.send(response.rows)
  } catch (ex) {
    next(ex)
  }
})

app.get('/api/flavors/:id', async (req, res, next) => {
    try {
      const SQL = `
        SELECT * from flavors WHERE id=$1;
      `
      const response = await client.query(SQL, [req.params.id])
      res.send(response.rows)
    } catch (ex) {
      next(ex)
    }
})

app.put('/api/flavors/:id', async (req, res, next) => {
  try {
    const SQL = `
      UPDATE flavors
      SET name=$1, is_favorite=$2, updated_at= now()
      WHERE id=$3 RETURNING *
    `
    const response = await client.query(SQL, [req.body.name, req.body.is_favorite, req.params.id])
    res.send(response.rows[0])
  } catch (ex) {
    next(ex)
  }
})

app.delete('/api/flavors/:id', async (req, res, next) => {
  try {
    const SQL = `
      DELETE from flavors
      WHERE id = $1
    `
    const response = await client.query(SQL, [req.params.id])
    res.sendStatus(204)
  } catch (ex) {
    next(ex)
  }
})

const init = async () => {
    await client.connect()
    let SQL = `
      DROP TABLE IF EXISTS flavors;
      CREATE TABLE flavors(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        is_favorite BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `
    await client.query(SQL)
    console.log('tables created')
   SQL = `
      INSERT INTO flavors(name, is_favorite) VALUES('Chocolate', true);
      INSERT INTO flavors(name) VALUES('Vanilla');
      INSERT INTO flavors(name) VALUES('Strawberry');
    `
    await client.query(SQL)
    console.log('data seeded')
    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`listening on port ${port}`))
}

init();