// Admin advert control page JavaScript

// Check if user is logged in
function checkAdminLogin() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'account.html';
    }
}

// Video management
let videos = JSON.parse(localStorage.getItem('advertVideos')) || [];

function renderVideoList() {
    const videoList = document.getElementById('video-list');
    videoList.innerHTML = '';
    
    if (videos.length === 0) {
        videoList.innerHTML = '<p style="text-align: center; color: #999;">No videos uploaded yet</p>';
        return;
    }
    
    videos.forEach((video, index) => {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';
        videoItem.innerHTML = `
            <div class="video-info">
                <h4>${video.name}</h4>
                <p>Clip Name: ${video.clipName || 'Unnamed'}</p>
                <video width="150" height="100" style="margin-top: 10px;">
                    <source src="${video.url}" type="video/mp4">
                </video>
            </div>
            <button class="remove-btn" onclick="removeVideo(${index})">Remove</button>
        `;
        videoList.appendChild(videoItem);
    });
}

function removeVideo(index) {
    if (confirm('Are you sure you want to remove this video?')) {
        videos.splice(index, 1);
        localStorage.setItem('advertVideos', JSON.stringify(videos));
        renderVideoList();
        updateAdvertVideosOnAllPages();
        alert('Video removed successfully!');
    }
}

function updateAdvertVideosOnAllPages() {
    // Trigger update on all pages by dispatching a custom event
    window.dispatchEvent(new CustomEvent('videosUpdated'));
}

document.getElementById('upload-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('video-upload');
    const nameInput = document.getElementById('video-name');
    const file = fileInput.files[0];
    
    if (file) {
        // Validate video type
        if (!file.type.startsWith('video/')) {
            alert('Please select a valid video file');
            return;
        }
        
        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            alert('File size should be less than 50MB');
            return;
        }
        
        const url = URL.createObjectURL(file);
        videos.push({ 
            name: file.name, 
            url: url,
            clipName: nameInput.value,
            uploadedAt: new Date().toLocaleString()
        });
        localStorage.setItem('advertVideos', JSON.stringify(videos));
        renderVideoList();
        updateAdvertVideosOnAllPages();
        fileInput.value = '';
        nameInput.value = '';
        alert('Video uploaded successfully!');
    }
});

// Initialize
checkAdminLogin();
renderVideoList();