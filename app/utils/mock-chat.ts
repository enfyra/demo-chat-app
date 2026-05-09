import type { ChatListItem, ChatMessage, ChatUser, Conversation } from '~/types/chat';

export const currentUser: ChatUser = {
  id: 'u-1',
  email: 'enfyra@admin.com',
  displayName: 'Thinh Do',
  statusText: 'Building with Enfyra',
  lastSeenAt: new Date().toISOString(),
};

export const maiUser: ChatUser = {
  id: 'u-2',
  email: 'mai@enfyra.dev',
  displayName: 'Mai Tran',
  statusText: 'Available',
  lastSeenAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
};

export const longUser: ChatUser = {
  id: 'u-3',
  email: 'long@enfyra.dev',
  displayName: 'Long Pham',
  statusText: 'Online',
  lastSeenAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
};

export const linhUser: ChatUser = {
  id: 'u-4',
  email: 'linh@enfyra.dev',
  displayName: 'Linh Nguyen',
  statusText: 'In a meeting',
  lastSeenAt: new Date(Date.now() - 1000 * 60 * 21).toISOString(),
};

export const khoaUser: ChatUser = {
  id: 'u-5',
  email: 'khoa@enfyra.dev',
  displayName: 'Khoa Le',
  statusText: 'Offline',
  lastSeenAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
};

export const chatUsers: ChatUser[] = [
  currentUser,
  maiUser,
  longUser,
  linhUser,
  khoaUser,
];

const member = (user: ChatUser, role: 'owner' | 'member' = 'member') => ({
  id: `m-${user.id}`,
  role,
  member: user,
  lastReadAt: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
});

export const conversations: Conversation[] = [
  {
    id: 'c-1',
    kind: 'dm',
    title: 'Mai Tran',
    members: [member(currentUser), member(maiUser)],
    lastMessageText: 'The chat opened instantly on my other tab.',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    unreadCount: 2,
  },
  {
    id: 'c-2',
    kind: 'group',
    title: 'Product Launch',
    description: 'Planning room for the launch team',
    members: [member(currentUser, 'owner'), member(maiUser), member(longUser), member(linhUser)],
    lastMessageText: 'Everyone should see the update live.',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    unreadCount: 0,
  },
  {
    id: 'c-3',
    kind: 'dm',
    title: 'Khoa Le',
    members: [member(currentUser), member(khoaUser)],
    lastMessageText: 'Can you check the OAuth set-cookie config?',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 44).toISOString(),
    unreadCount: 0,
  },
];

export const chatList: ChatListItem[] = conversations.map((conversation) => ({
  conversation,
  membership: conversation.members.find((item) => item.member.id === currentUser.id) ?? member(currentUser),
  members: conversation.members.map((item) => item.member),
  unreadCount: conversation.unreadCount,
}));

export const messages: ChatMessage[] = [
  {
    id: 'msg-1',
    conversationId: 'c-1',
    sender: maiUser,
    text: 'I can see the new conversation on desktop and mobile.',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    status: 'persisted',
  },
  {
    id: 'msg-2',
    conversationId: 'c-1',
    sender: currentUser,
    text: 'Nice. History also reloads correctly after refresh.',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: 'persisted',
  },
  {
    id: 'msg-3',
    conversationId: 'c-1',
    sender: maiUser,
    text: 'Typing state feels immediate too.',
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    status: 'persisted',
  },
  {
    id: 'msg-4',
    conversationId: 'c-1',
    sender: currentUser,
    text: 'Good. That is enough for the demo chat experience.',
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    status: 'delivered',
  },
  {
    id: 'msg-5',
    conversationId: 'c-2',
    sender: longUser,
    text: 'Group messages are showing up for everyone online.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: 'persisted',
  },
  {
    id: 'msg-6',
    conversationId: 'c-2',
    sender: currentUser,
    text: 'This room is capped like a normal small team chat.',
    createdAt: new Date(Date.now() - 1000 * 60 * 21).toISOString(),
    status: 'persisted',
  },
  {
    id: 'msg-7',
    conversationId: 'c-3',
    sender: khoaUser,
    text: 'Can you check the OAuth set-cookie config?',
    createdAt: new Date(Date.now() - 1000 * 60 * 44).toISOString(),
    status: 'persisted',
  },
];
