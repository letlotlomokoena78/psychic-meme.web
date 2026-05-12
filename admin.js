// Admin page JavaScript

function showTab(tabName, evt) {
    // Hide all tab contents
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Remove active class from buttons
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));

    // Show selected tab
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    const activeButton = Array.from(buttons).find(btn => btn.dataset.tab === tabName);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Form submission (placeholder)
document.querySelectorAll('.account-form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Admin form submitted! (This is a placeholder)');
    });
});

// Video management
let videos = JSON.parse(localStorage.getItem('advertVideos')) || [];

function renderVideoList() {
    const videoList = document.getElementById('video-list');
    if (!videoList) return;
    videoList.innerHTML = '';
    videos.forEach((video, index) => {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';
        videoItem.innerHTML = `
            <span>${video.name}</span>
            <button onclick="removeVideo(${index})">Remove</button>
        `;
        videoList.appendChild(videoItem);
    });
}

function removeVideo(index) {
    videos.splice(index, 1);
    localStorage.setItem('advertVideos', JSON.stringify(videos));
    renderVideoList();
    updateAdvertVideo();
}

const uploadForm = document.getElementById('upload-form');
if (uploadForm) {
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const fileInput = document.getElementById('video-upload');
        const file = fileInput?.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            videos.push({ name: file.name, url: url });
            localStorage.setItem('advertVideos', JSON.stringify(videos));
            renderVideoList();
            updateAdvertVideo();
            if (fileInput) fileInput.value = '';
        }
    });
}

function updateAdvertVideo() {
    const videoElement = document.getElementById('advert-video');
    if (!videoElement || videos.length === 0) return;

    let currentIndex = 0;
    videoElement.src = videos[currentIndex].url;
    setInterval(() => {
        currentIndex = (currentIndex + 1) % videos.length;
        videoElement.src = videos[currentIndex].url;
    }, 10000); // 10 seconds
}

// Initialize
renderVideoList();
updateAdvertVideo();