const mongoose = require('mongoose')
const express = require('express')
const morgan = require('morgan')
const { urlencoded, json } = require('body-parser')

app = express()

const http = require('http')

// // Create an instance of the http server to handle HTTP requests
// app = http.createServer((req, res) => {
//   // Set a response type of plain text for the response
//   res.writeHead(200, { 'Content-Type': 'text/plain' })

//   // Send back a response and end the connection
//   res.end('Hello World!\n')
// })

// // Start the server on port 3000
// app.listen(3000, '127.0.0.1')
// console.log('Node server running on port 3000')

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  body: {
    type: String,
    minLength: 10,
  },
})
// noteSchema.post('save', function (doc, next) {
//   next()
//   console.log('hi')
// })
const Note = mongoose.model('note', noteSchema)

app.use(morgan('dev'))
app.use(urlencoded({ extended: true }))
app.use(json())

function createCallback(err, doc, res) {
  if (err) {
    console.log(err)
    return
  }
  doc = doc.toObject()
  delete doc.__v
  res.status(201).json(doc)
}

app.get('/notes', async (req, res) => {
  const notes = await Note.find({}).lean().exec()
  notes.forEach((note) => delete note.__v)

  res.status(200).json(notes)
})

app.post('/notes', async (req, res) => {
  // Note.create(req.body, createCallback)
  Note.create(req.body, function (err, doc) {
    createCallback(err, doc, res)
  })
})

const connect = () => {
  return mongoose.connect('mongodb://localhost:27017/whatever', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
}

connect()
  .then(async (connection) => {
    // app.listen(5000)

    const Model = mongoose.model(
      'model',
      mongoose.Schema(
        {
          status: String,
          comments: [{ body: { type: String } }],
        },
        { optimisticConcurrency: true }
      )
    )
    const { _id } = await Model.create({ status: 'bye' })
    // 2 copies of the same document

    const doc1 = await Model.findOne({ _id })

    // Delete first 3 comments from `doc1`

    // console.log(doc1)
    console.log(doc1)
    doc1.status = 'hello'
    await doc1.save()
    console.log(doc1)
    // console.log(doc1)
    // The below `save()` will throw a VersionError, because you're trying to
    // modify the comment at index 1, and the above `splice()` removed that
    // comment.
    // doc2.set('comments.1.body', 'new comment')
    const doc2 = await Model.findOne({ _id })
    console.log(doc2)
    doc2.status = 'hellos'
    await doc2.save()
    console.log(doc2)

    // // Throws 'VersionError: No matching document found for id "..." version 0'
    // console.log(house)
    // console.log(await House.findOne({ _id }))
    // // house.status = 'APPROVED'
    // await house.save()
  })
  .catch((e) => console.error(e))
