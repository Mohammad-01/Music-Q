const player = new Plyr('#player', {
    youtube: { noCookie: true }
});

const songQueue = [];

document.getElementById('songForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const songUrl = document.getElementById('songUrl').value;
    const videoId = getYouTubeID(songUrl);
    if (videoId) {
        songQueue.push(videoId);
        document.getElementById('songUrl').value = '';
        updateQueue();
        if (songQueue.length === 1) {
            playSong(videoId);
        }
    }
});

function getYouTubeID(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^&\n]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
}

function updateQueue() {
    const queueElement = document.getElementById('songQueue');
    queueElement.innerHTML = '';
    songQueue.forEach((videoId, index) => {
        const li = document.createElement('li');
        li.textContent = `Song ${index + 1}: ${videoId}`;
        queueElement.appendChild(li);
    });
}

function playSong(videoId) {
    player.source = {
        type: 'video',
        sources: [{
            src: videoId,
            provider: 'youtube',
        }],
    };
    player.play();
}

player.on('ended', () => {
    songQueue.shift(); // Remove the played song
    updateQueue();
    if (songQueue.length > 0) {
        playSong(songQueue[0]); // Play the next song
    }
});
