

export interface UserT  {
    _id?: string,
    email: string,
    username: string,
    password: string,
    isAdmin: number,
    avatar?: string
}

export interface TwittT  {
    twitt: string,
    image?: string,
    user: string,
    comments?: string[]
    favourites?: number,
    commentsNumber: number
}

export interface CommentT  {
    comment: string,
    user: string
}

export interface SchemaNameT  {
    User: string,
    Admin: string,
    Twitt: string, 
    Comment: string
}

export type PORT = string | number
