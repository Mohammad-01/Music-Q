const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let songQueue = []; // تخزين قائمة الأغاني

app.use(express.static('public')); // تأكد من أن ملفات HTML و CSS و JS موجودة في مجلد 'public'

io.on('connection', (socket) => {
    console.log('a user connected');

    // إرسال قائمة الأغاني الحالية عند الاتصال
    socket.emit('updateQueue', songQueue);

    socket.on('addSong', (song) => {
        songQueue.push(song);
        io.emit('updateQueue', songQueue); // إرسال قائمة الأغاني المحدثة لجميع المستخدمين
    });

    socket.on('playNext', () => {
        songQueue.shift(); // إزالة الأغنية الحالية
        io.emit('updateQueue', songQueue); // إرسال قائمة الأغاني المحدثة لجميع المستخدمين
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
