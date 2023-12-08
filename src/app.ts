// src/app.ts
import express, { Express, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid';
import morgan from 'morgan';
import bodyParser from 'body-parser'
import pgPromise from 'pg-promise'
const pgp = pgPromise();

const app: Express = express()
const port: number = 3000

app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

let conn: any = null
// function connectPostgresSQL
const connectPostgresSQL = async () => {
  conn = await pgp({
    host: '127.0.0.1',
    port: 5432,
    database: 'test_db',
    user: 'root',
    password: 'root',
  })
}

//** Root Path Hello World*/
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Hello Express + TypeScirpt!!',
  })
})

//** Get all Users */
app.get('/users', async (req: Request, res: Response) => {
  let users: any = []

  try {
    // get all users from database
    users = await conn.any('SELECT uid, name FROM users');
    // success
  }
  catch (e) {
    // error
    console.error(e);
  }


  //response
  res.json({
    request_id: uuidv4(),
    message: 'get all users success',
    data: users
  })
})

//** Create Users */
app.post('/users', async (req: Request, res: Response) => {
  let body: any = req.body

  try {
    // generate uid with uuid
    let uid = uuidv4()
    // insert users data to database
    await conn.any('INSERT INTO users(uid, name, age) VALUES($1, $2, $3)', [uid, body.name, body.age]);
    // success
    body.uid = uid
  }
  catch (e) {
    // error
    console.error(e);
  }

  //response
  res.json({
    request_id: uuidv4(),
    message: "create users success",
    data: body
  })
})

//** Get Users by ID */
app.get('/users/:id', async (req: Request, res: Response) => {
  let uid: string = req.params.id
  let resUser: any = []

  try {
    // find users in database with uid
    resUser = await conn.any('SELECT * FROM users WHERE uid = $1', [uid]);
    // success
  }
  catch (e) {
    // error
    console.error(e);
  }

  //response
  res.json({
    request_id: uuidv4(),
    message: "get users by id success",
    data: resUser[0]
  })
})

//** Update Users by ID */
app.put('/users/:id', async (req: Request, res: Response) => {
  let uid: string = req.params.id
  let body: any = req.body

  let resUser: any = []
  try {
    // find users in database with uid
    resUser = await conn.any('SELECT * FROM users WHERE uid = $1', [uid]);
    // success
  }
  catch (e) {
    // error
    console.error(e);
  }

  // edit replace previous users data with body request
  let updateUser = resUser[0]
  updateUser.name = body.name || updateUser.name
  updateUser.age = body.age || updateUser.age

  try {
    // update new users data to database by uid
    await conn.any('UPDATE users SET name = $1, age = $2 WHERE uid = $3', [updateUser.name, updateUser.age, uid]);
    // success
  }
  catch (e) {
    // error
    console.error(e);
  }

  //response
  res.json({
    request_id: uuidv4(),
    message: "update users by id success",
    data: updateUser
  })
})

//** Delete Users by ID */
app.delete('/users/:id', async (req: Request, res: Response) => {
  let uid: string = req.params.id

  try {
    // delete users in database by uid
    await conn.any('DELETE FROM users WHERE uid = $1', [uid]);
    // success
  }
  catch (e) {
    // error
    console.error(e);
  }

  res.json({
    request_id: uuidv4(),
    message: "delete users by id success",
    data: { deleted: uid }
  })
})

app.listen(port, async () => {
  await connectPostgresSQL()
  console.log(`Application is running on port ${port}`)
})
