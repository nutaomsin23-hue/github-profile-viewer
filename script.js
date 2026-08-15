// --- 1. ดึง Elements หลักมาเตรียมไว้ ---
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const profileContainer = document.getElementById('profile-container');
const messageContainer = document.getElementById('message-container');
const avatarEl = document.querySelector('.avatar');
const nameEl = document.querySelector('.name');
const usernameEl = document.querySelector('.username');
const bioEl = document.querySelector('.bio');
const statValues = document.querySelectorAll('.stat-value');
const reposEl = statValues[0];
const followersEl = statValues[1];
const followingEl = statValues[2];
const githubBtn = document.querySelector('.github-btn');

// 🔴 ตัวแปรใหม่ของ Phase 6
const reposContainer = document.getElementById('repos-container'); 

// --- 2. ฟังก์ชันจัดการ UI ---
function showMessage(text, isError = false) {
    profileContainer.classList.add('hidden');
    messageContainer.classList.remove('hidden');
    messageContainer.textContent = text;
    if (isError) {
        messageContainer.classList.add('error');
    } else {
        messageContainer.classList.remove('error');
    }
}

function showProfile() {
    messageContainer.classList.add('hidden');
    profileContainer.classList.remove('hidden');
}

function updateProfile(data) {
    avatarEl.src = data.avatar_url;
    nameEl.textContent = data.name || data.login;
    usernameEl.textContent = `@${data.login}`;
    bioEl.textContent = data.bio || "This user has no bio.";
    reposEl.textContent = data.public_repos;
    followersEl.textContent = data.followers;
    followingEl.textContent = data.following;
    githubBtn.href = data.html_url;
}

// --- 3. 🔴 ฟังก์ชันใหม่ Phase 6: ดึงข้อมูล Repository ---
async function getRepos(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`);
        
        if (response.ok) {
            const repos = await response.json();
            reposContainer.innerHTML = ''; // ล้างข้อมูลเก่าทุกครั้ง
            
            if (repos.length === 0) {
                reposContainer.innerHTML = '<p class="no-repos">No public repositories found.</p>';
                return;
            }

            repos.forEach(repo => {
                const repoEl = document.createElement('a');
                repoEl.classList.add('repo-card');
                repoEl.href = repo.html_url;
                repoEl.target = '_blank';
                
                repoEl.innerHTML = `
                    <h3>${repo.name}</h3>
                    <p>${repo.description || 'No description available'}</p>
                    <div class="repo-meta">
                        <span>⭐ ${repo.stargazers_count}</span>
                        <span>🍴 ${repo.forks_count}</span>
                        <span>${repo.language || 'N/A'}</span>
                    </div>
                `;
                
                reposContainer.appendChild(repoEl);
            });
        }
    } catch (error) {
        console.error("Error fetching repos:", error);
    }
}

// --- 4. ฟังก์ชันหลักสำหรับดึงข้อมูล API ---
async function getUserProfile(username) {
    try {
        showMessage("Loading..."); 
        
        const response = await fetch(`https://api.github.com/users/${username}`);
        
        if (response.ok) {
            const data = await response.json();
            updateProfile(data);
            getRepos(username); // 🔴 สั่งให้ไปดึง Repo ต่อทันที
            showProfile(); 
        } else if (response.status === 404) {
            showMessage("User not found. Please check the username and try again.", true);
        } else {
            showMessage("Something went wrong. Please try again later.", true);
        }
    } catch (error) {
        showMessage("Network error. Please check your connection.", true);
    }
}

// --- 5. สั่งงานเมื่อกดปุ่มค้นหา ---
searchBtn.addEventListener('click', () => {
    const username = searchInput.value.trim(); 
    
    if (username) {
        getUserProfile(username);
    } else {
        showMessage("Please enter a GitHub username.", true);
    }
});
// ให้ช่องค้นหารับฟังเหตุการณ์ตอนกดคีย์บอร์ด
searchInput.addEventListener('keypress', (event) => {
    // ถ้าปุ่มที่กดคือปุ่ม Enter
    if (event.key === 'Enter') {
        searchBtn.click(); // จำลองการคลิกปุ่ม Search
    }
});