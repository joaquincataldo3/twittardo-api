import { Model, Document } from 'mongoose'

// Extiende el tipo SessionData para incluir userLoggedId
declare module 'express-session' {
    interface SessionData {
      userLogged: UserT | null; // Asegúrate de que coincida con el tipo correcto
    }
  }

export interface UserT {
    _id?: string,
    email: string,
    username: string,
    password?: string,
    isAdmin: number,
    avatar: string,
    image_url: string,
    favourites?: TwittT[] | [],
    twitts?: TwittT[] | [],
    followers?: UserToFront[] | [],
    following?: UserToFront | [],
    comments?: CommentT[] | []
}

export interface TwittT {
    twitt: string,
    image?: string | null
    image_url?: string | null
    user: string
    comments?: string[]
    favourites?: number
    commentsNumber: number
}

export interface TwittTPopulated extends TwittT {
    id: string
    user: UserT
    comments: CommentT
}


export interface CommentT {
    comment: string,
    user: string,
    twittCommented: string,
    favourites: number
}

export interface SchemaNameT {
    User: string,
    Admin: string,
    Twitt: string,
    Comment: string
}

export type PORT = string | number

export interface LoginUser {
    email: string,
    password: string
}

export interface RegisterUser {
    email: string,
    username: string,
    password: string
}