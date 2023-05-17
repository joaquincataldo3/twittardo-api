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
    users: string,
    admins: string
    twitts: string, 
    comments: string
}
