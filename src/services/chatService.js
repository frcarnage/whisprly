// src/services/chatService.js

import { database } from '../firebase';
import {
  ref,
  onChildAdded,
  onValue,
  push,
  set,
  update,
  serverTimestamp
} from 'firebase/database';

/**
 * Listen for new chats in /supportChats
 * @param {Function} callback - Function to call with each chat {chatId, ...data}
 */
export function listenChats(callback) {
  const chatsRef = ref(database, 'supportChats');
  onChildAdded(chatsRef, (snapshot) => {
    callback({ chatId: snapshot.key, ...snapshot.val() });
  });
}

/**
 * Listen for all messages in a given chat
 * @param {string} chatId - Chat session ID
 * @param {Function} callback - Function to call with each message {messageId, ...data}
 */
export function listenMessages(chatId, callback) {
  const messagesRef = ref(database, `supportChats/${chatId}/messages`);
  onChildAdded(messagesRef, (snapshot) => {
    callback({ messageId: snapshot.key, ...snapshot.val() });
  });
}

/**
 * Send a message from an agent to the user
 * @param {string} chatId - Chat session ID
 * @param {string} agentId - UID of the agent sending the message
 * @param {string} text - Message text content
 */
export function sendAgentMessage(chatId, agentId, text) {
  const msgRef = push(ref(database, `supportChats/${chatId}/messages`));
  return set(msgRef, {
    senderId: agentId,
    text,
    timestamp: Date.now(),
    type: 'text'
  });
}

/**
 * Update chat status (e.g., open, closed)
 * @param {string} chatId
 * @param {string} status - "open" | "closed"
 */
export function updateChatStatus(chatId, status) {
  const chatRef = ref(database, `supportChats/${chatId}`);
  return update(chatRef, { status });
}

/**
 * Assign an agent to a chat
 * @param {string} chatId
 * @param {string} agentId
 */
export function assignAgent(chatId, agentId) {
  const chatRef = ref(database, `supportChats/${chatId}/participants`);
  return update(chatRef, { [agentId]: true });
}

/**
 * Listen for updates to a chat's info (status, participants, etc.)
 */
export function onChatInfoChange(chatId, callback) {
  const chatRef = ref(database, `supportChats/${chatId}`);
  onValue(chatRef, (snapshot) => {
    callback({ chatId: snapshot.key, ...snapshot.val() });
  });
}
