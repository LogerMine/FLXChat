import { auth, db } from "./firebase.js";
import { 
    collection, query, orderBy, onSnapshot, addDoc, serverTimestamp 
} from "firebase/firestore";
import { escapeHtml, getNickname, formatTime } from "./utils.js";

const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');

let unsubscribeMessages = null;

// Подписка на сообщения (только для общего чата)
export function subscribeToGlobalChat() {
    if (unsubscribeMessages) unsubscribeMessages();
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    unsubscribeMessages = onSnapshot(q, (snapshot) => {
        messagesContainer.innerHTML = '';
        snapshot.forEach((doc) => {
            const msg = doc.data();
            // Пропускаем удалённые
            if (msg.deleted) return;
            // Показываем только сообщения с chatId = 'global' или без chatId (старые)
            if (msg.chatId && msg.chatId !== 'global') return;

            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${msg.senderId === auth.currentUser?.uid ? 'own' : 'other'}`;
            msgDiv.innerHTML = `
                <div class="message-sender">${escapeHtml(msg.senderName || 'Unknown')}</div>
                <div class="message-text">${escapeHtml(msg.text)}</div>
                <div class="message-time">${formatTime(msg.timestamp)}</div>
            `;
            messagesContainer.appendChild(msgDiv);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

// Отправка сообщения
window.sendMessage = async () => {
    const text = messageInput.value.trim();
    if (!text || !auth.currentUser) return;

    const senderName = await getNickname(auth.currentUser.uid);
    try {
        await addDoc(collection(db, "messages"), {
            text,
            senderId: auth.currentUser.uid,
            senderName,
            timestamp: serverTimestamp(),
            deleted: false,
            chatId: 'global'   // метка общего чата
        });
        messageInput.value = '';
    } catch (error) {
        alert('Ошибка отправки: ' + error.message);
    }
};

// Автоподписка при загрузке страницы
if (auth.currentUser) {
    subscribeToGlobalChat();
} else {
    // Будет вызвано после входа через onAuthStateChanged
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if (user) {
            subscribeToGlobalChat();
            unsubscribeAuth();
        }
    });
}