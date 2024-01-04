import Twitt from '../database/models/twitt';
import Comment from '../database/models/comment';
import Favourite from '../database/models/favourites';
import User from '../database/models/user';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { TwittT } from '../types';
import { handlePutCommand, handleGetCommand, handleDeleteCommand } from '../utils/util-functions/s3ConfigCommands';

dotenv.config()

const controller = {
    allTwitts: async (req: Request, res: Response) => {
        try {
            const page: string = String(req.query.p);
            const pageNumber: number = Number(page)
            if (isNaN(pageNumber) || pageNumber < 1) {
                return res.status(400).json({ msg: 'El número de página debe ser un número positivo.' });
            }
            const twittPerPage: number = 5;
            const twitts = await Twitt
                    .find(  )
                    .sort({ createdAt: -1 })
                    .skip(twittPerPage * (pageNumber - 1))
                    .limit(twittPerPage)
                    .select('-password -email')
                    .populate('user', '-password -email')
                    .populate('comments')
            
            await Twitt.populate(twitts, { path: 'comments.user' });

            // aca voy por cada imagen y hago un getobjectcommand para obtener el url
            let folder = 'twitts';
            for (let i = 0; i < twitts.length; i++) {
                let twitt = twitts[i];
                if (twitt.image) {
                    let url = await handleGetCommand(twitt.image, folder);
                    twitt.image_url = url;
                }
            };
            // voy por cada imagen del usuario
            folder = 'avatars';
            for (let i = 0; i < twitts.length; i++) {
                let twitt = twitts[i];
                let url = await handleGetCommand(twitt.user.avatar, folder);
                twitt.user.image_url = url;
            };

            return res.status(200).json(twitts);
        } catch (error) {
            return res.status(500).json({ msg: `Problema mientras se buscaban los twitts: ${error}` })
        }

    },
    allTwittsByUser: async (req: Request, res: Response) => {
        try {
            const page: string = String(req.query.p);
            const pageNumber: number = Number(page)
            if (isNaN(pageNumber) || pageNumber < 1) {
                return res.status(400).json({ msg: 'El número de página debe ser un número positivo.' });
            }
            const twittPerPage: number = 5;
            const userIdParam: string = req.params.userId;
            const twitts = await Twitt
                    .find({ user: userIdParam })
                    .sort({ createdAt: -1 })
                    .skip(twittPerPage * (pageNumber - 1))
                    .limit(twittPerPage)
                    .select('-password -email')
                    .populate('user', '-password -email')
                    .populate('comments')
        
            // aca voy por cada imagen y hago un getobjectcommand para obtener el url
            let folder = 'twitts';
            for (let i = 0; i < twitts.length; i++) {
                let twitt = twitts[i];
                if (twitt.image) {
                    let url = await handleGetCommand(twitt.image, folder);
                    twitt.image_url = url;
                }
            };
            // voy por cada imagen del usuario
            folder = 'avatars';
            for (let i = 0; i < twitts.length; i++) {
                let twitt = twitts[i];
                let url = await handleGetCommand(twitt.user.avatar, folder);
                twitt.user.image_url = url;
            };

            return res.status(200).json(twitts);
        } catch (error) {
            return res.status(500).json({ msg: `Problema mientras se buscaban los twitts: ${error}` })
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
                .populate({ path: 'user', select: '-password -email' })
                .populate({ path: 'comments', model: 'Comment' })
            if (!twittResponse) {
                return res.status(404).json({ msg: "Twitt no encontrado" })
            } else {
                let folder;
                if (twittResponse.comments.length > 0) {
                    for (const comment of twittResponse.comments) {
                        await comment.populate('user', '-password');
                    }
                    folder = "avatars";
                    for (let i = 0; i < twittResponse.comments.length; i++) {
                        const user = twittResponse.comments[i].user
                        let url = await handleGetCommand(user.avatar, folder);
                        user.image_url = url;
                    }
                }
                if (twittResponse.image) {
                    folder = 'twitts';
                    let url = await handleGetCommand(twittResponse.image, folder);
                    twittResponse.image_url = url;
                }

                // voy por cada imagen del usuario
                folder = 'avatars';
                let url = await handleGetCommand(twittResponse.user.avatar, folder);
                twittResponse.user.image_url = url;

                return res.status(200).json(twittResponse);
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

            const favTwittToDb = {
                user: userId,
                twittFaved: twittId
            }

            const favourite = await Favourite.create(favTwittToDb);

            await Twitt.findByIdAndUpdate(userId,
                {
                    $addToSet: {
                        favourites: favourite._id
                    },
                }, {
                new: true
            })

            await User.findByIdAndUpdate(userId,
                {
                    $addToSet: {
                        favourites: favourite._id
                    },
                }, {
                new: true
            })

            return res.status(201).json({ msg: 'Twitt faveado satisfactoriamente' });

        } catch (error) {
            return res.status(400).json({ msg: `Problema mientras se faveaba un twitt: ${error}` });
        }
    },
    unfavOneTwitt: async (req: Request, res: Response) => {
        try {
            const twittId = req.params.twittId;
            const userId = req.params.userId;

            if (!isValidObjectId(userId) || !isValidObjectId(twittId)) {
                return res.status(400).json({ msg: 'Twitt o usuario id invalido' });
            }

            await Twitt.findByIdAndUpdate(
                twittId,
                { $inc: { favourites: -1 } },
                { new: true }
            );

            await User.findByIdAndUpdate(
                userId,
                {
                    $pull: {
                        favourites: twittId,
                    },
                },
                { new: true }
            );

            return res.status(200).json({ msg: 'Desfavorecido satisfactoriamente' });

        } catch (error) {
            return res.status(400).json({ msg: `Problema mientras se desfavorecía un twitt: ${error}` });
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
            return res.status(400).json({ msg: `Problema mientras se creaba un twitt: ${error}` });
        }
    },
    deleteTwitt: async (req: Request, res: Response) => {

        try {
            const twittIdToDelete = req.params.twittIdToDelete;
            if (!isValidObjectId(twittIdToDelete)) {
                return res.status(400).json({ msg: 'Twitt id invalido' })
            }
            const deletedDocument = await Twitt.findByIdAndRemove(twittIdToDelete);
            if (deletedDocument) {
                const folder = 'twitts';
                await handleDeleteCommand(deletedDocument.image, folder)
            }
            await Comment.deleteMany({ twittCommented: twittIdToDelete });
            return res.status(200).json(twittIdToDelete);
        } catch (error) {
            return res.status(400).json({ msg: `Problema mientras se borraba un twitt: ${error}` });
        }

    }
}

export default controller