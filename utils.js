import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase.js";

export function showError(message) {
    const errorDiv = document.getElementById('auth-error');
    if (errorDiv) errorDiv.textContent = message;
    else alert(message);
}

export function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export async function getNickname(uid) {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        return userDoc.data()?.nickname || 'Неизвестно';
    } catch {
        return 'Неизвестно';
    }
}

export function formatTime(timestamp) {
    if (!timestamp || !timestamp.toDate) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}