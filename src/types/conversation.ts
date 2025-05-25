export interface IParticipant {
  _id: string
  firstName: string
  lastName: string
  username: string
  profilePicture?: string
}

export interface IMessagePreview {
  _id: string
  content: string
  createdAt: string
  sender: IParticipant
}

export interface IConversation {
  _id: string
  participants: IParticipant[]
  isGroup: boolean
  name?: string
  lastMessage?: IMessagePreview
  unreadCount?: number
  createdAt?: string
  updatedAt?: string
}
