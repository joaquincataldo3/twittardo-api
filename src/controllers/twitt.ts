import { Request, Response } from 'express'
import Twitt from '../database/models/twitt'
import { isValidObjectId } from 'mongoose'
import { TwittT } from '../types'


const controller = {
    allTwitts: async (_req: Request, res: Response) => {
        try {
            const twitts = await Twitt.find()
            res.status(200).json(twitts)
        } catch (error) {
            console.log(error)
            res.status(400).json({ msg: `Problema mientras se buscaban los twitts: ${error}` })
        }

    },
    createTwitt: async (req: Request, res: Response) => {
        try {
            const userId = req.params.id

            const twittData: TwittT = {
                twitt: req.body.twitt,
                user: userId
            }

            if (req.file) {
                twittData.image = req.file.filename
            }

            const newTwitt = await Twitt.create(twittData)

            res.status(200).json(newTwitt)

        } catch (error) {
            console.log(error)
            res.status(400).json({msg: `Problema mientras se creaba un twitt: ${error}`})
        }
    },
    deleteTwitt: async (req: Request, res: Response) => {

        try {
            const twittIdToDelete = req.params.twittIdToDelete

            if(!isValidObjectId(twittIdToDelete)){
                res.status(400).json({msg: 'Twitt id invalido'})
            }

            await Twitt.findByIdAndRemove(twittIdToDelete)

            res.status(200).json(twittIdToDelete)

        } catch (error) {
            console.log(error)
            res.status(400).json({msg: `Problema mientras se borraba un twitt: ${error}`})
        }
       


    }
}

export default controller