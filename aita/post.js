const middleBar = document.getElementById('middle-bar');
const container = document.querySelector('.container');
const postContent = document.getElementById('post-content');
const chatbox = document.getElementById('chatbox');
let isDragging = false;

middleBar.addEventListener('mousedown', () => {
    isDragging = true;
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const containerWidth = container.offsetWidth;
    const mouseXPercentage = (e.clientX / containerWidth) * 100;
    postContent.style.width = `${mouseXPercentage}%`;
    chatbox.style.width = `${100 - mouseXPercentage}%`;
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});


function sendMessage() {
    const chatInput = document.getElementById('message-input');
    const message = chatInput.value.trim();
    const messagesDiv = document.getElementById('messages');
    const existingMessages = Array.from(messagesDiv.getElementsByClassName('chat-message')).map(messageDiv => messageDiv.textContent);
    const postId = new URLSearchParams(window.location.search).get('post_id');

    if (message) {
        const newMessages = existingMessages.concat([message]);
        const params = new URLSearchParams();
        params.append('messages', JSON.stringify(newMessages));
        params.append('postId', postId); 

        fetch(`http://35.153.232.100/api/chat?${params.toString()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
        .then(response => response.json())
        .then(messages => {
            // Update the messages in the chat box
            messagesDiv.innerHTML = messages.map((message, index) => {
                if (index % 2 === 0) {
                    return `<div class="chat-message you">${message}</div>`;
                } else {
                    return `<div class="chat-message other">${message}</div>`;
                }
            }).join('');
            // Clear input
            chatInput.value = '';
        })
        .catch(error => console.error('Error sending chat message:', error));
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const postId = new URLSearchParams(window.location.search).get('post_id');

    // Fetch post details
    fetch(`http://35.153.232.100/api/post/${postId}`)
        .then(response => response.json())
        .then(post => {
            const postDiv = document.getElementById('post-content');
            postDiv.innerHTML = `
                <div class="post-header">
                    <div class="post-title">${post.title}</div>
                    <div class="post-author-date">${post.username} / ${post.date_posted}</div>
                    <div class="speech-controls">
                        <button id="slowDownButton" onclick="slowDownSpeech()"><i class="fas fa-fast-backward"></i></button>
                        <button id="playPauseButton" onclick="togglePlayPause()"><i class="fas fa-play"></i></button>
                        <button id="speedUpButton" onclick="speedUpSpeech()"><i class="fas fa-fast-forward"></i></button>
                    </div>
                </div>
                <div class="post-contents">${post.contents}</div>
            `;
                //<div class="post-summary">${post.summary}</div>
            if (post.comments && post.comments.length > 0) {
                post.comments.forEach(commentSection => {
                    renderComments(commentSection, document.getElementById('post-content'));
                });
            }
        })
        .catch(error => console.error('Error fetching post:', error));

    // Handle chat messages
    const chatInput = document.getElementById('message-input');
    chatInput.addEventListener('keyup', event => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    // Send button event
    const sendButton = document.querySelector('.send-button');
    sendButton.addEventListener('click', () => {
        sendMessage();
    });
});

let speechRate = 1.5; // Starting at normal speed
let speechSynthesisInstance = new SpeechSynthesisUtterance();
let isSpeaking = false;

function togglePlayPause() {
    if (isSpeaking) {
        pauseSpeech();
        document.getElementById("playPauseButton").innerHTML = '<i class="fas fa-play"></i>';
    } else {
        if (speechSynthesisInstance.paused) {
            // Instead of resuming, we'll restart the speech
            playSpeech();
        } else {
            playSpeech();
        }
        document.getElementById("playPauseButton").innerHTML = '<i class="fas fa-pause"></i>';
    }
}

function pauseSpeech() {
    window.speechSynthesis.cancel(); // Using cancel to ensure it stops completely
    isSpeaking = false;
}

function playSpeech() {
    const postContents = document.querySelector('.post-contents').innerText;
    speechSynthesisInstance = new SpeechSynthesisUtterance(postContents); // Create a new instance to ensure it starts from the beginning
    speechSynthesisInstance.rate = speechRate;
    window.speechSynthesis.speak(speechSynthesisInstance);
    isSpeaking = true;
}

function resumeSpeech() {
    window.speechSynthesis.resume();
    isSpeaking = true;
}

function speedUpSpeech() {
    speechRate = Math.min(speechRate + 0.5, 3); // Max 3x speed
    if (isSpeaking) {
        speechSynthesisInstance.rate = speechRate;
        // Restarting to apply the new rate
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speechSynthesisInstance);
    }
}

function slowDownSpeech() {
    speechRate = Math.max(speechRate - 0.5, 0.5); // Min 0.5x speed
    if (isSpeaking) {
        speechSynthesisInstance.rate = speechRate;
        // Restarting to apply the new rate
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speechSynthesisInstance);
    }
}

// You can also stop the speech when the page is unloaded or user navigates away
window.addEventListener('unload', () => {
    window.speechSynthesis.cancel();
});



function renderComments(comment, container, depth = 0) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment' + (comment.author === 'karmaking' ? ' karmaking' : '');

    const header = document.createElement('div');
    header.className = 'comment-header';

    const author = document.createElement('span');
    author.className = 'comment-author ' + comment.author;
    author.textContent = comment.author;
    header.appendChild(author);

    const collapseButton = document.createElement('span');
    collapseButton.className = 'collapse-button';
    collapseButton.textContent = '[+]';
    collapseButton.onclick = () => toggleCollapse(commentDiv);
    header.appendChild(collapseButton);

    commentDiv.appendChild(header);

    const commentText = document.createElement('div');
    commentText.className = 'comment-text';
    commentText.textContent = comment.text;
    commentDiv.appendChild(commentText);

    container.appendChild(commentDiv);

    // Recursively render nested comments
    if (comment.responses && comment.responses.length > 0) {
        const responsesDiv = document.createElement('div');
        responsesDiv.className = 'comment-responses';
        commentDiv.appendChild(responsesDiv);

        comment.responses.forEach(response => {
            renderComments(response, responsesDiv, depth + 1);
        });
    }
}

function toggleCollapse(commentDiv) {
    const commentText = commentDiv.querySelector('.comment-text');

    // Toggle the main comment's text
    if (commentText.style.display === 'none') {
        commentText.style.display = '';
    } else {
        commentText.style.display = 'none';
    }

    // Find all nested comment divs and apply the collapse/expand state
    const nestedComments = commentDiv.querySelectorAll('.comment');
    nestedComments.forEach(nested => {
        if (commentText.style.display === 'none') {
            nested.classList.add('collapsed');
        } else {
            nested.classList.remove('collapsed');
        }
    });
}
