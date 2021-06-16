const mongoose = require('mongoose')
const Document = require('./Document.js')


MONGO_URI = "mongodb+srv://docsAdmin:G9kOrOUxdlQBlMOY@cluster0.vvytz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})

const deafultValue = ""
const PORT = 4000 || process.env.PORT
const io = require('socket.io')(PORT, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})


io.on('connection', socket => {
    console.log("User joined the session")
    socket.on('get-document', async documentID => {
        const doc = await findOrCreateDoc(documentID)
        socket.join(documentID)
        socket.emit('load-document', doc.data)
        socket.on('send-changes', delta => {
            socket.broadcast.to(documentID).emit('receive-changes', delta)
        })
        socket.on("save-document", async data => {
            await Document.findByIdAndUpdate(documentID, {data})
        })
    })
})

const findOrCreateDoc = async (id) => {
    if(id == null) return

    const doc = await Document.findById(id)

    if(doc) return doc
    return await Document.create({_id: id, data: deafultValue})
}



