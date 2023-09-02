import Twitt from '../database/models/twitt';
import User from '../database/models/user';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { TwittT, TwittTPopulated } from '../types';
import { handlePutCommand, handleGetCommand } from '../utils/s3ConfigCommands';

dotenv.config()

const controller = {
    allTwitts: async (req: Request, res: Response) => {
        try {
            const pages: string = String(req.query.p);
            const pagesNumber: number = Number(pages)
            const twittPerPage: number = 5;
            const twittsResponse = await Twitt
                .find()
                .sort({ createdAt: -1 })
                .skip(pagesNumber * twittPerPage)
                .limit(twittPerPage)
                .select('-password -email')
                .populate('user', '-password -email')
                .populate('comments')
            // two awaits bc we are populating comments and then user inside comments
            if (twittsResponse) {
                for (let twitt of twittsResponse) {
                    if (twitt.comments.length > 0) {
                        await twitt.populate('comments.user');
                    }
                }
            }
            const twitts: TwittTPopulated[] = twittsResponse.map((twitt: any) => ({
                twitt: twitt.twitt,
                user: twitt.user,
                image: twitt.image,
                comments: twitt.comments,
                favourites: twitt.favourites,
                commentsNumber: twitt.commentsNumber,
            }));
            // aca voy por cada imagen y hago un getobjectcommand para obtener el url
            for (let i = 0; i < twitts.length; i++) {
                let twitt = twitts[i];
                if (twitt.image) {
                    let url = await handleGetCommand(twitt.image);
                    twitt.image_url = url; 
                }
            };

            return res.status(200).json(twitts);
        } catch (error) {
            console.log(error)
            return res.status(400).json({ msg: `Problema mientras se buscaban los twitts: ${error}` })
        }

    },
    oneTwitt: async (req: Request, res: Response) => {
        try {
            const twittId: string = req.params.twittId
            if (!isValidObjectId(twittId)) {
                return res.status(400).json({ msg: 'Twitt o usuario id invalido' })
            }
            const twittResponse = await Twitt
                .findById(twittId)
                .select('-password -email')
                .populate('user', '-password -email')
                .populate('comments')
            if (!twittResponse) {
                return res.status(404).json({ msg: "Twitt no encontrado" })
            } else {
                await Promise.all(twittResponse.map(async (twitt: any) => {
                    if (twitt.comments.length > 0) {
                        await twitt.populate('comments.user').execPopulate();
                    }
                }));
                const twitt: TwittTPopulated = {
                    twitt: twittResponse.twitt,
                    image: twittResponse.image,
                    user: twittResponse.user,
                    comments: twittResponse.comments,
                    favourites: twittResponse.favourites,
                    commentsNumber: twittResponse.commentsNumber,
                    // Aquí debes agregar las propiedades pobladas de user y comments
                };
                return res.status(200).json(twitt)
            }
        } catch (error) {
            console.log(error)
            return res.status(400).json({ msg: `Problema mientras se buscaba un twitt en particular: ${error}` })
        }

    },
    favOneTwitt: async (req: Request, res: Response) => {
        try {
            const twittId = req.params.twittId
            const userId = req.params.userId

            if (!isValidObjectId(userId) || !isValidObjectId(twittId)) {
                return res.status(400).json({ msg: 'Twitt o usuario id invalido' })
            }

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

            return res.status(201).json({ msg: 'Twitt faveado satisfactoriamente' })

        } catch (error) {
            console.log(error)
            return res.status(400).json({ msg: `Problema mientras se faveaba un twitt: ${error}` })
        }
    },
    createTwitt: async (req: Request, res: Response) => {
        try {
            const userId: string = req.params.userId
            const twittImage = req.file as Express.Multer.File

            if (!isValidObjectId(userId)) {
                return res.status(400).json({ msg: 'Id de usuario invalido' })
            }

            let randomName = null;
            if (twittImage) {
               randomName = await handlePutCommand(twittImage);
            }

            const twittData: TwittT = {
                twitt: req.body.twitt,
                favourites: 0,
                commentsNumber: 0,
                user: userId,
                image: randomName != null ? randomName : null,
                image_url: null
            };


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