// declare a declaration file
// global instance
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGO_URI : any
            JWT : string
        }
    }
}

export {}