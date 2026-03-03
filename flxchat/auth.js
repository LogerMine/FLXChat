import { auth, db } from "./firebase.js";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged 
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { showError } from "./utils.js";
import { loadFriends } from "./friends.js";

const authScreen = document.getElementById('auth-screen');
const mainScreen = document.getElementById('main-screen');
const userNickSpan = document.getElementById('user-nick');
const userRoleSpan = document.getElementById('user-role');
const adminSection = document.getElementById('admin-section');

// Регистрация
window.handleRegister = async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const nickname = document.getElementById('nickname').value.trim();

    if (!email || !password || !nickname) {
        showError('Заполните все поля');
        return;
    }

    try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCred.user;
        await setDoc(doc(db, "users", user.uid), {
            email,
            nickname,
            role: "user",
            friends: [],
            createdAt: new Date(),
            lastActive: new Date(),
            banned: false
        });
        alert('Регистрация успешна! Теперь войдите.');
    } catch (error) {
        showError(error.message);
    }
};

// Вход
window.handleLogin = async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        showError(error.message);
    }
};

// Выход
window.logout = async () => {
    await signOut(auth);
    authScreen.classList.add('active');
    mainScreen.classList.remove('active');
};

// Проверка бана при каждом действии? Используем onAuthStateChanged
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            // На всякий случай удаляем пользователя из auth?
            await signOut(auth);
            return;
        }
        const userData = userSnap.data();

        // Проверка бана
        if (userData.banned) {
            alert('Вы забанены!');
            await signOut(auth);
            return;
        }

        // Обновляем lastActive
        await updateDoc(userRef, { lastActive: new Date() });

        // Показываем основной экран
        authScreen.classList.remove('active');
        mainScreen.classList.add('active');

        // Отображаем информацию
        userNickSpan.textContent = userData.nickname;
        userRoleSpan.textContent = userData.role === 'admin' ? '👑 Админ' : '👤 Пользователь';

        if (userData.role === 'admin') {
            adminSection.style.display = 'block';
        } else {
            adminSection.style.display = 'none';
        }

        // Загружаем друзей
        loadFriends();
    } else {
        authScreen.classList.add('active');
        mainScreen.classList.remove('active');
    }
});