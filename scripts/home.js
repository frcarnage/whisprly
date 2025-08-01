posts.forEach(async (post) => {
  const userRef = doc(db, "users", post.userId);
  const userSnap = await getDoc(userRef);
  const user = userSnap.exists() ? userSnap.data() : null;

  const postDiv = document.createElement("div");
  postDiv.className = "post";

  postDiv.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 1rem;">
      <a href="/profile.html?uid=${post.userId}" style="display: flex; align-items: center; text-decoration: none; color: inherit;">
        <img src="${user?.profilePic || 'https://via.placeholder.com/40'}"
             alt="${user?.username || 'User'}"
             style="width: 40px; height: 40px; border-radius: 50%; margin-right: 0.8rem;" />
        <strong>${user?.username || 'Unknown User'}</strong>
      </a>
    </div>

    <h3>${post.title}</h3>
    <p>${post.content}</p>
    ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post Image" style="max-width:100%;border-radius:10px;">` : ""}
    <p><small>Likes: ${post.likes.length} | Comments: ${post.commentsCount}</small></p>
    <hr />
  `;

  postsContainer.appendChild(postDiv);
});
