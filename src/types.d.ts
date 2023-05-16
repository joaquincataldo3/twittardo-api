export type UserT = {
    email: string,
    username: string,
    password: string,
    avatar?: string
}

export type TwittT = {
    twitt: string,
    image?: string,
    user: string,
    comments?: string[]
}
