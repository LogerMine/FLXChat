import { auth, db } from "./firebase.js";
import { 
    collection, query, where, getDocs, doc, updateDoc, writeBatch 
} from "firebase/firestore";
import { escapeHtml } from "./utils.js";

const adminModal = document.getElementById('admin-modal');
const adminUsersList = document.getElementById('admin-users-list');

window.showAdminPanel = () => {
    adminModal.style.display = 'block';
    searchUsersAdmin();
};

window.closeAdminModal = () => {
    adminModal.style.display = 'none';
};

// Поиск пользователей для админа
window.searchUsersAdmin = async () => {
    const searchTerm = document.getElementById('admin-user-search').value.trim();
    let q;
    if (searchTerm) {
        q = query(collection(db, "users"), 
            where("nickname", ">=", searchTerm), 
            where("nickname", "<=", searchTerm + '\uf8ff'));
    } else {
        q = query(collection(db, "users"));
    }
    const snapshot = await getDocs(q);
    adminUsersList.innerHTML = '';
    snapshot.forEach(doc => {
        if (doc.id === auth.currentUser?.uid) return;
        const user = doc.data();
        const div = document.createElement('div');
        div.className = 'admin-user-item';
        div.innerHTML = `
            <span>${escapeHtml(user.nickname)} (${escapeHtml(user.email)}) [${user.role}]</span>
            <button onclick="setUserRole('${doc.id}', 'admin')">👑 Админ</button>
            <button onclick="setUserRole('${doc.id}', 'user')">👤 Юзер</button>
            <button onclick="toggleBan('${doc.id}', ${user.banned})">${user.banned ? '🔓 Разбанить' : '🔒 Забанить'}</button>
            <button onclick="deleteUserMessages('${doc.id}')">🗑️ Удалить сообщения</button>
        `;
        adminUsersList.appendChild(div);
    });
};

// Смена роли
window.setUserRole = async (uid, role) => {
    await updateDoc(doc(db, "users", uid), { role });
    alert('Роль обновлена');
    searchUsersAdmin();
};

// Бан / разбан
window.toggleBan = async (uid, isBanned) => {
    await updateDoc(doc(db, "users", uid), { banned: !isBanned });
    alert('Статус бана изменён');
    searchUsersAdmin();
};

// Удалить все сообщения пользователя (мягкое удаление)
window.deleteUserMessages = async (uid) => {
    if (!confirm('Удалить все сообщения этого пользователя?')) return;
    const messagesQuery = query(collection(db, "messages"), where("senderId", "==", uid));
    const snapshot = await getDocs(messagesQuery);
    const batch = writeBatch(db);
    snapshot.forEach(doc => {
        batch.update(doc.ref, { deleted: true });
    });
    await batch.commit();
    alert('Сообщения помечены как удалённые');
};