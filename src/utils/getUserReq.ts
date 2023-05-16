import express from "express"

export interface GetInfoAuthRequest extends express.Request {
  user: any // or any other type
}