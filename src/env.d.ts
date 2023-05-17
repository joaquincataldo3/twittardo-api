// declare a declaration file
// global instance
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGO_URI : string
            JWT : string
            ADMIN_KEY: string
        }
    }
}

export {}