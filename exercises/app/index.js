const express = require('express')
const morgan = require('morgan')
const connect = require('../connect')
const { json, urlencoded } = require('body-parser')
const app = express()
const Todo = require('./todo')

app.use(morgan('dev'))
app.use(urlencoded({ extended: true }))
app.use(json())

app.get('/todo/:id', async (req, res) => {
  try {
    const todoId = req.params.id
    const todo = await Todo.findById(todoId).lean().exec()
    delete todo.__v
    res.status(200).json(todo)
  } catch (err) {
    console.log(err)
    res.status(500).send()
  }
})

app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find({}).lean().exec()
    todos.forEach((todo) => delete todo.__v)
    res.status(200).json(todos)
  } catch (err) {
    console.log(err)
    res.status(500).send()
  }
})

app.post('/todo', async (req, res) => {
  const todoToCreate = req.body.todo
  Todo.create(todoToCreate, function (err, doc) {
    try {
      if (err) {
        console.log(err)
      }

      doc = doc.toObject()
      delete doc.__v
      res.status(201).json(doc)
    } catch (err) {
      console.log(err)
      res.status(500).send()
    }
  })
})

connect('mongodb://localhost:27017/yo')
  .then(() =>
    app.listen(4000, () => {
      console.log('server on http://localhost:4000')
    })
  )
  .catch((e) => console.error(e))
