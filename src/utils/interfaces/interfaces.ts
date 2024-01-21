// Extiende el tipo SessionData para incluir userLoggedId
declare module 'express-session' {
    interface SessionData {
      userLogged: IUser | null; // Asegúrate de que coincida con el tipo correcto
    }
  }

export interface IUser {
    _id?: string,
    email: string,
    username: string,
    password?: string,
    isAdmin: number,
    image: IImage
    favourites?: string[] | [],
    twitts?: string[] | [],
    followers?: string[] | [],
    following?: string | [],
    comments?: IComment[] | []
}

export interface ITwitt {
    twitt: string,
    image: IImage
    userId: string
    comments: IComment[]
    favourites?: number
}

export interface IComment {
    comment: string,
    user: string,
    twittCommented: string,
    favourites: number
}

export interface ISchemaName {
    User: string,
    Admin: string,
    Twitt: string,
    Comment: string
}

export interface ILoginUser {
    email: string,
    password: string
}

export interface IRegisterUser {
    email: string,
    username: string,
    password: string
}

export interface IImage {
    secure_url: string
    public_id: string
}

export interface IDefaultAvatarImage {
    default_secure_url: string
    default_public_id: string
}

export interface ICloudinaryFolders {
    twittsFolder: string
    avatarsFolder: string
}

export interface IModelPaths {
    commentPath: string
    twittPath: string
    userPath: string
    favouritePath: string
    twittCommentedPath: string
}

export type PORT = string | number


export interface IModelNames {
    CommentModel: string
    TwittModel: string
    UserModel: string
    FavouriteModel: string
}