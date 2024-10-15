const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let songQueue = []; // قائمة الأغاني

io.on('connection', (socket) => {
    console.log('A user connected');

    // عند إضافة أغنية جديدة
    socket.on('addSong', (videoId) => {
        songQueue.push(videoId); // إضافة الأغنية إلى القائمة
        io.emit('updateQueue', songQueue); // إرسال القائمة المحدثة لكل المستخدمين
    });

    // مسح قائمة الأغاني
    socket.on('clearQueue', () => {
        songQueue.length = 0; // مسح القائمة
        io.emit('updateQueue', songQueue); // إرسال القائمة الفارغة لكل المستخدمين
    });

    // تشغيل الأغنية التالية
    socket.on('playNext', () => {
        if (songQueue.length > 0) {
            songQueue.shift(); // إزالة أول أغنية
            io.emit('updateQueue', songQueue); // إرسال القائمة المحدثة
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

app.use(express.static('public')); // لنفترض أن ملفات HTML و CSS و JS في مجلد public

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
