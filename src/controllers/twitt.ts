import { Request, Response } from 'express'
import Twitt from '../database/models/twitt'
import { TwittT } from '../types'


const controller = {

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



    }

}

export default controller