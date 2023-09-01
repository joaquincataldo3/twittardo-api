import { Model, Document } from 'mongoose'

export interface UserT {
    _id?: string,
    email: string,
    username: string,
    password: string,
    isAdmin: number,
    avatar?: string,
    favourites?: TwittT[] | [],
    twitts?: TwittT[] | [],
    followers?: UserToFront[] | [],
    following?: UserToFront | []
}

export interface UserToFront {
    username: string,
    email: string,
    avatar: string,
    isAdmin: number,
    favourites: TwittT[] | [],
    twitts: TwittT[] | [],
    followers: UserToFront[] | [],
    following: UserToFront | []
}

export interface TwittT {
    twitt: string,
    image?: string,
    user: string,
    comments?: string[]
    favourites?: number,
    commentsNumber: number
}

export interface TwittTPopulated extends TwittT {
    user: UserT;
    comments: CommentT
}


export interface CommentT {
    comment: string,
    user: string
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