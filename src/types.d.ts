export type UserT = {
    email: string,
    username: string,
    password: string,
    isAdmin: boolean,
    avatar?: string
}

export type TwittT = {
    twitt: string,
    image?: string,
    user: string,
    comments?: string[]
}

export type CommentT = {
    comment: string,
    user: string
}

export type SchemaNameT = {
    User: string,
    Admin: string,
    Twitt: string, 
    Comment: string
}

export type PORT = string | number
