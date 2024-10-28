const player = new Plyr('#player', {
    youtube: { noCookie: true },
    autoplay: true // تأكد من تعيين autoplay هنا
});

const songQueue = [];
let currentlyPlaying = null; // متغير لتتبع الأغنية الحالية
const socket = io(); // الاتصال بالسيرفر

// إضافة مستمع لحدث إرسال النموذج
document.getElementById('songForm').addEventListener('submit', function (e) {
    e.preventDefault(); // منع إعادة تحميل الصفحة
    const songUrl = document.getElementById('songUrl').value; // الحصول على رابط الأغنية
    const videoId = getYouTubeID(songUrl); // استخراج ID من رابط يوتيوب
    if (videoId && !songQueue.includes(videoId)) { // تحقق من عدم وجود الأغنية مسبقًا
        socket.emit('addSong', videoId); // إرسال ID إلى السيرفر
        document.getElementById('songUrl').value = ''; // مسح حقل الإدخال
    } else {
        console.error('Invalid YouTube URL or song already exists in the queue'); // طباعة خطأ إذا كان الرابط غير صحيح أو الأغنية موجودة مسبقًا
    }
});

// مستمع لزر مسح الأغاني
document.getElementById('clearQueue').addEventListener('click', function () {
    socket.emit('clearQueue'); // إبلاغ السيرفر لمسح قائمة الأغاني
});

// عندما يتصل المستخدم بالسيرفر، يتم إرسال قائمة الأغاني
socket.on('updateQueue', function (queue) {
    songQueue.length = 0; // مسح قائمة الأغاني الحالية
    queue.forEach((videoId) => {
        songQueue.push(videoId); // إضافة الأغاني الجديدة
    });
    updateQueue(); // تحديث واجهة المستخدم
    if (songQueue.length > 0 && currentlyPlaying !== songQueue[0]) {
        playSong(songQueue[0]); // تشغيل أول أغنية فقط إذا لم تكن مشغلة
    }
});

// دالة لاستخراج ID من رابط يوتيوب
function getYouTubeID(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^&\n]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null; // إرجاع ID الأغنية
}

// دالة لتحديث قائمة الأغاني في واجهة المستخدم
function updateQueue() {
    const queueElement = document.getElementById('songQueue');
    queueElement.innerHTML = ''; // مسح القائمة السابقة
    songQueue.forEach((videoId, index) => {
        const li = document.createElement('li'); // إنشاء عنصر قائمة جديد
        li.textContent = `Song ${index + 1}: ${videoId}`; // إضافة نص
        queueElement.appendChild(li); // إضافة العنصر إلى القائمة
    });
}

// دالة لتشغيل الأغنية
function playSong(videoId) {
    if (currentlyPlaying === videoId) return; // إذا كانت الأغنية الحالية هي نفسها، فلا تفعل شيئًا

    console.log(`Playing song: ${videoId}`); // طباعة ID الأغنية
    player.source = {
        type: 'video',
        sources: [{
            src: videoId,
            provider: 'youtube',
        }],
    };
    currentlyPlaying = videoId; // تحديث الأغنية الحالية
    player.volume = 0; // كتم الصوت
    player.play().catch(error => {
        console.error('Error playing song:', error); // طباعة أي أخطاء أثناء التشغيل
    });
}

// عند انتهاء الأغنية، نطلب تشغيل الأغنية التالية
player.on('ended', () => {
    socket.emit('playNext'); // إبلاغ السيرفر بتشغيل الأغنية التالية
});

// قائمة التنقل
document.getElementById('menuToggle').addEventListener('click', function () {
    const menu = document.getElementById('menu');
    menu.classList.toggle('hidden'); // تغيير ظهور القائمة
});