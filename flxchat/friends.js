import { auth, db } from "./firebase.js";
import { 
    collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove 
} from "firebase/firestore";
import { escapeHtml } from "./utils.js";

const friendsList = document.getElementById('friends-list');
const searchResults = document.getElementById('search-results');

// Загрузить список друзей
export async function loadFriends() {
    if (!auth.currentUser) return;
    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    const friendIds = userDoc.data().friends || [];
    friendsList.innerHTML = '';
    for (const friendId of friendIds) {
        const friendDoc = await getDoc(doc(db, "users", friendId));
        if (friendDoc.exists()) {
            const friend = friendDoc.data();
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${escapeHtml(friend.nickname)}</span>
                <div>
                    <button class="btn-icon small" onclick="removeFriend('${friendId}')" title="Удалить">❌</button>
                    <button class="btn-icon small" onclick="startPrivateChat('${friendId}')" title="Личный чат">💬</button>
                </div>
            `;
            friendsList.appendChild(li);
        }
    }
}

// Поиск пользователей по нику
window.searchUsers = async () => {
    const searchTerm = document.getElementById('friend-search').value.trim();
    if (!searchTerm) return;
    const q = query(collection(db, "users"), 
        where("nickname", ">=", searchTerm), 
        where("nickname", "<=", searchTerm + '\uf8ff'));
    const snapshot = await getDocs(q);
    searchResults.innerHTML = '';
    snapshot.forEach(doc => {
        if (doc.id === auth.currentUser.uid) return;
        const user = doc.data();
        const div = document.createElement('div');
        div.innerHTML = `
            <span>${escapeHtml(user.nickname)}</span>
            <button class="btn-icon small" onclick="addFriend('${doc.id}')">➕</button>
        `;
        searchResults.appendChild(div);
    });
};

// Добавить в друзья (обоюдно)
window.addFriend = async (friendId) => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const friendRef = doc(db, "users", friendId);
    await updateDoc(userRef, { friends: arrayUnion(friendId) });
    await updateDoc(friendRef, { friends: arrayUnion(auth.currentUser.uid) });
    alert('Друг добавлен');
    loadFriends();
    searchUsers(); // обновить поиск
};

// Удалить из друзей
window.removeFriend = async (friendId) => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const friendRef = doc(db, "users", friendId);
    await updateDoc(userRef, { friends: arrayRemove(friendId) });
    await updateDoc(friendRef, { friends: arrayRemove(auth.currentUser.uid) });
    loadFriends();
};

// Заглушка для личного чата
window.startPrivateChat = (friendId) => {
    alert('Личный чат пока в разработке. Здесь будет переход на диалог с другом.');
    // В реальном проекте нужно менять подписку на сообщения с соответствующим chatId
};