import { database } from '../firebase';
import {
  ref,
  onChildAdded,
  onValue,
  push,
  set,
  update
} from 'firebase/database';

// Listen to all chats
export function listenChats(callback) {
  const chatsRef = ref(database, 'supportChats');
  onChildAdded(chatsRef, snapshot => {
    callback({ chatId: snapshot.key, ...snapshot.val() });
  });
}

// Listen to messages of a single chat
export function listenMessages(chatId, callback) {
  const messagesRef = ref(database, `supportChats/${chatId}/messages`);
  onChildAdded(messagesRef, snapshot => {
    callback({ messageId: snapshot.key, ...snapshot.val() });
  });
}

// Send agent reply
export function sendAgentMessage(chatId, agentId, text) {
  const msgRef = push(ref(database, `supportChats/${chatId}/messages`));
  return set(msgRef, {
    senderId: agentId,
    text,
    timestamp: Date.now(),
    type: 'text'
  });
}

// Update (close/open) a chat
export function updateChatStatus(chatId, status) {
  const chatRef = ref(database, `supportChats/${chatId}`);
  return update(chatRef, { status });
}

// Assign agent to chat
export function assignAgent(chatId, agentId) {
  const partRef = ref(database, `supportChats/${chatId}/participants`);
  return update(partRef, { [agentId]: true });
}

// Listen to chat info
export function onChatInfoChange(chatId, callback) {
  const chatRef = ref(database, `supportChats/${chatId}`);
  onValue(chatRef, snapshot => {
    callback({ chatId: snapshot.key, ...snapshot.val() });
  });
}
