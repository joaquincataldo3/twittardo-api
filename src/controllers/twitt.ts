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
            const page: string = String(req.query.p);
            console.log(page);
            const pageNumber: number = Number(page)
            const twittPerPage: number = 5;
            const twittsResponse = await Twitt
                .find()
                .sort({ createdAt: -1 })
                .skip(twittPerPage * (pageNumber - 1))
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
            // aca voy por cada imagen y hago un getobjectcommand para obtener el url
            let folder = 'twitts';
            for (let i = 0; i < twittsResponse.length; i++) {
                let twitt = twittsResponse[i];
                if (twitt.image) {
                    let url = await handleGetCommand(twitt.image, folder);
                    twitt.image_url = url;
                }
            };
            // voy por cada imagen del usuario
            folder = 'avatars';
            for (let i = 0; i < twittsResponse.length; i++) {
                let twitt = twittsResponse[i];
                let url = await handleGetCommand(twitt.user.avatar, folder);
                twitt.user.image_url = url;
            };
            const twitts: TwittTPopulated[] = twittsResponse.map((twitt: any) => ({
                _id: twitt._id,
                twitt: twitt.twitt,
                user: twitt.user,
                image: twitt.image,
                image_url: twitt.image_url,
                comments: twitt.comments,
                favourites: twitt.favourites,
                commentsNumber: twitt.commentsNumber,
            }));
            console.log(twitts.length);
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
                if (twittResponse.comments.length > 0) {
                    await twittResponse.populate('comments.user')
                }
                let folder;

                if (twittResponse.image) {
                    folder = 'twitts';
                    let url = await handleGetCommand(twittResponse.image, folder);
                    twittResponse.image_url = url;
                }

                // voy por cada imagen del usuario
                folder = 'avatars';
                let url = await handleGetCommand(twittResponse.user.avatar, folder);
                twittResponse.user.image_url = url;

                const twitt: TwittTPopulated = {
                    twitt: twittResponse.twitt,
                    image: twittResponse.image,
                    user: twittResponse.user,
                    image_url: twittResponse.image_url,
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
            const twittId = req.params.twittId;
            const userId = req.params.userId;

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

            return res.status(201).json({ msg: 'Twitt faveado satisfactoriamente' });

        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: `Problema mientras se faveaba un twitt: ${error}` });
        }
    },
    createTwitt: async (req: Request, res: Response) => {
        try {
            const userId: string = req.params.userId;
            const twittImage = req.file as Express.Multer.File;

            if (!isValidObjectId(userId)) {
                return res.status(400).json({ msg: 'Id de usuario invalido' });
            }

            let randomName = null;
            const folder = 'twitts'
            if (twittImage) {
                randomName = await handlePutCommand(twittImage, folder);
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

            return res.status(200).json(newTwitt);

        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: `Problema mientras se creaba un twitt: ${error}` });
        }
    },
    deleteTwitt: async (req: Request, res: Response) => {

        try {
            const twittIdToDelete = req.params.twittIdToDelete;

            if (!isValidObjectId(twittIdToDelete)) {
                return res.status(400).json({ msg: 'Twitt id invalido' })
            }

            await Twitt.findByIdAndRemove(twittIdToDelete);

            return res.status(200).json(twittIdToDelete);

        } catch (error) {
            console.log(error);
            return res.status(400).json({ msg: `Problema mientras se borraba un twitt: ${error}` });
        }



    }
}

export default controller