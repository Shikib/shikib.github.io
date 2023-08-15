document.addEventListener('DOMContentLoaded', () => {
    const postsDiv = document.getElementById('posts');
    postsDiv.insertAdjacentHTML('beforebegin', '<div class="header">/r/aita</div>');

    fetch('http://35.153.232.100/api/posts')
        .then(response => response.json())
        .then(posts => {
            posts.forEach(post => {
                const postDiv = document.createElement('div');
                postDiv.className = 'post';
                postDiv.innerHTML = `
                    <div class="post-actions">
                        <button class="action-button like" data-post-id="${post.post_id}" onclick="like(event, ${post.post_id})"><i class="fas fa-thumbs-up"></i></button>
                        <button class="action-button dislike" data-post-id="${post.post_id}" onclick="dislike(event, ${post.post_id})"><i class="fas fa-thumbs-down"></i></button>
                    </div>
                    <div class="post-content">
                        <div class="post-title">${post.title}</div>
                        <div class="post-subinfo">${post.username} | ${post.date_posted}</div> <!-- Moved date and name -->
                        <div class="post-summary">${post.summary}</div>
                        <div>
                            <span class="share-button" onclick="share(${post.post_id})">Share</span>
                            <span class="chat-button" onclick="redirectToPost(${post.post_id})">Chat Now</span> <!-- Changed to redirect to post -->
                        </div>
                    </div>
                `;
                postDiv.onclick = (e) => {
                    if (e.target.className !== 'action-button like' && e.target.className !== 'action-button dislike' && e.target.className !== 'share-button' && e.target.className !== 'chat-button') {
                        redirectToPost(post.post_id);
                    }
                };
                postsDiv.appendChild(postDiv);
            });
        })
        .catch(error => console.error('Error fetching posts:', error));
});

function redirectToPost(post_id) {
    var currentLocation = window.location.href;
    var newLocation = `http://shikib.com/aita/post.html?post_id=${post_id}`;
    window.location.href = newLocation;
}


function share(post_id) {
    const urlToShare = `/post.html?post_id=${post_id}`;
    const modalHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center;">
            <div style="background-color: #2c2c2c; padding: 20px; border-radius: 10px; text-align: center; max-width: 400px; color: #fff;">
                <p style="margin-bottom: 10px;">Copy this link to share:</p>
                <input type="text" readonly value="${urlToShare}" style="width: 100%; padding: 5px; border: 1px solid #555; margin-bottom: 15px; background-color: #444; color: #fff;" />
                <button onclick="document.querySelector('.share-modal').remove()" style="background-color: #007bff; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 5px;">Close</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', `<div class="share-modal">${modalHTML}</div>`);
    document.querySelector('.share-modal input').select();
    document.execCommand('copy');
}

function like(event, post_id) {
    event.stopPropagation();
    toggleVote(post_id, 'like', '#28a745');
}

function dislike(event, post_id) {
    event.stopPropagation();
    toggleVote(post_id, 'dislike', '#dc3545');
}

function toggleVote(post_id, action, color) {
    const likeButton = document.querySelector(`button.like[data-post-id="${post_id}"]`);
    const dislikeButton = document.querySelector(`button.dislike[data-post-id="${post_id}"]`);

    const button = action === 'like' ? likeButton : dislikeButton;
    const otherButton = action === 'like' ? dislikeButton : likeButton;

    // Check if the button is already active
    if (button.getAttribute('data-active') === 'true') {
        button.style.color = ''; // Reset to original color if clicked again
        button.setAttribute('data-active', 'false');
    } else {
        button.style.color = color; // Set the color when clicked
        button.setAttribute('data-active', 'true');
        otherButton.style.color = ''; // Reset the other button's color
        otherButton.setAttribute('data-active', 'false');
    }

    console.log(`${action === 'like' ? 'Liked' : 'Disliked'} post with ID: ${post_id}`);
}
