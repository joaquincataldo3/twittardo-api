import { Request, Response } from 'express'
import Twitt from '../database/models/twitt'
import User from '../database/models/user'
import { isValidObjectId } from 'mongoose'
import { TwittT } from '../types'



const controller = {
    allTwitts: async (req: Request, res: Response) => {
        try {
            const pages = req.query.p;
            const pagesNumber = Number(pages)
            const twittPerPage = 5;
            const twitts = await Twitt
                .find()
                .skip(pagesNumber * twittPerPage) // pages could be 0, 1, 2 etc. times the movie per page
                .limit(twittPerPage) // limiting it to 5 movies per page   
                .select('-password -email')
                .populate('user', '-password -email')
            return res.status(200).json(twitts)
        } catch (error) {
            console.log(error)
            return res.status(400).json({ msg: `Problema mientras se buscaban los twitts: ${error}` })
        }

    },
    oneTwitt: async (req: Request, res: Response) => {
        try {
            const twittId = req.params.twittId
            const twitt = await Twitt
                .findById(twittId)
                .select('-password -email')
                .populate('user', '-password -email')
            return res.status(200).json(twitt)
        } catch (error) {
            console.log(error)
            return res.status(400).json({ msg: `Problema mientras se buscaba un twitt en particular: ${error}` })
        }

    },
    favOneTwitt: async (req: Request, res: Response) => {
        try {
            const twittId = req.params.twittId
            const userId = req.params.userId

            await Twitt.findByIdAndUpdate(twittId, 
                { $inc: { favourites: 1 } },
                { new: true });
            
           await User.findByIdAndUpdate(userId, 
                {
                $addToSet: { 
                    favourites: twittId
                },
            }, {
                new: true
            })

            return res.status(201).json({msg: 'Twitt faveado satisfactoriamente'})

        } catch (error) {
            console.log(error)
            return res.status(400).json({ msg: `Problema mientras se faveaba un twitt: ${error}` })
        }
    },
    createTwitt: async (req: Request, res: Response) => {
        try {
            const userId = req.params.userId

            if (!isValidObjectId(userId)) {
                return res.status(400).json({ msg: 'Id de usuario invalido' })
            }

            const twittData: TwittT = {
                twitt: req.body.twitt,
                favourites: 0,
                commentsNumber: 0,
                user: userId
            }

            if (req.file) {
                twittData.image = req.file.path
            }

            const newTwitt = await Twitt.create(twittData)
            await User.findByIdAndUpdate(userId,
                {
                    $addToSet: {
                        twitts: newTwitt._id
                    },
                }, {
                new: true
            })

            return res.status(200).json(newTwitt)

        } catch (error) {
            console.log(error)
            return res.status(400).json({ msg: `Problema mientras se creaba un twitt: ${error}` })
        }
    },
    deleteTwitt: async (req: Request, res: Response) => {

        try {
            const twittIdToDelete = req.params.twittIdToDelete

            if (!isValidObjectId(twittIdToDelete)) {
                return res.status(400).json({ msg: 'Twitt id invalido' })
            }

            await Twitt.findByIdAndRemove(twittIdToDelete)

            return res.status(200).json(twittIdToDelete)

        } catch (error) {
            console.log(error)
            return res.status(400).json({ msg: `Problema mientras se borraba un twitt: ${error}` })
        }



    }
}

export default controller