const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const connect = (url) =>
  mongoose.connect(url, {
    // poolSize: 15,
    useNewUrlParser: true, //important
    // useUnifiedTopology: true, //NEVER USE THIS
    useCreateIndex: true, //important
  })

module.exports = connect
