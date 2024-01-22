import Twitt from '../database/models/twitt';
import Comment from '../database/models/comment';
import User from '../database/models/user';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { modelPaths } from '../utils/constants/modelsPath';
import { IImage } from '../utils/interfaces/interfaces';
import { handleDeleteImage, handleUploadImage } from '../cloudinary/cloudinaryConfig';
import { folderNames } from '../cloudinary/cloudinaryConfig';

dotenv.config()

const { commentPath, userPath } = modelPaths;
const { twittsFolder } = folderNames;
const userExcludedField = '-password -email';

const controller = {
    allTwitts: async (req: Request, res: Response): Promise<void> => {
        try {
            const page: string = String(req.query.p);
            const pageNumber: number = Number(page)
            if (isNaN(pageNumber) || pageNumber < 1) {
                res.status(400).json({ msg: 'El número de página debe ser un número positivo.' });
            }
            const twittPerPage: number = 5;
            const twitts = await Twitt
                .find()
                .sort({ createdAt: -1 })
                .skip(twittPerPage * (pageNumber - 1))
                .limit(twittPerPage)
                .populate(userPath, userExcludedField)
                .populate({
                    path: commentPath,
                    populate: {
                        path: userPath,
                        select: userExcludedField
                    }
                })

            await Twitt.populate(twitts, { path: 'comments.user' });
            console.log(twitts[0])
            res.status(200).json(twitts);
            return;
        } catch (error) {
            res.status(500).json({ msg: `Problema mientras se buscaban los twitts: ${error}` });
            return;
        }

    },
    oneTwitt: async (req: Request, res: Response): Promise<void> => {
        try {
            const twittId: string = req.params.twittId
            if (!isValidObjectId(twittId)) {
                res.status(400).json({ msg: 'Twitt o usuario id invalido' });
                return;
            }
            const twittResponse = await Twitt
                .findById(twittId)
                .populate({ path: 'user', select: userExcludedField })
                .populate({
                    path: commentPath,
                    populate: {
                        path: userPath,
                        select: userExcludedField
                    }
                })
            if (!twittResponse) {
                res.status(404).json({ msg: "Twitt no encontrado" });
                return;
            } else {
                res.status(200).json(twittResponse);
                return;
            }
        } catch (error) {
            res.status(500).json({ msg: `Problema mientras se buscaba un twitt en particular: ${error}` });
            return;
        }

    },
    favOneTwitt: async (req: Request, res: Response): Promise<void> => {
        try {
            const twittId = req.params.twittId;
            const userId = req.params.userId;
            if (!isValidObjectId(userId) || !isValidObjectId(twittId)) {
                res.status(400).json({ msg: 'Twitt o usuario id invalido' });
                return;
            }
            await Twitt.findByIdAndUpdate(userId,
                {
                    $addToSet: {
                        favourites: twittId
                    },
                }, {
                new: true
            })
            await User.findByIdAndUpdate(userId,
                {
                    $addToSet: {
                        favourites: twittId
                    },
                }, {
                new: true
            })
            res.status(201).json({ msg: 'Twitt faveado satisfactoriamente' });
            return;
        } catch (error) {
            res.status(500).json({ msg: `Problema mientras se faveaba un twitt: ${error}` });
            return;
        }
    },
    unfavOneTwitt: async (req: Request, res: Response): Promise<void> => {
        try {
            const twittId = req.params.twittId;
            const userId = req.params.userId;
            if (!isValidObjectId(userId) || !isValidObjectId(twittId)) {
                res.status(400).json({ msg: 'Twitt o usuario id invalido' });
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
            res.status(200).json({ msg: 'Desfaveado satisfactoriamente' });
            return;
        } catch (error) {
            res.status(500).json({ msg: `Problema mientras se desfavorecía un twitt: ${error}` });
            return;
        }
    },
    createTwitt: async (req: Request, res: Response): Promise<void> => {
        try {
            const userInRequest = req.user;
            const {_id} = userInRequest;
            if (!isValidObjectId(_id)) {
                res.status(400).json({ msg: 'Id de usuario invalido' });
                return;
            }
            let result: IImage | null; 
            if(req.files) {
                const files = Array.isArray(req.files.image) ? req.files.image : [req.files.image];
                const file = files[0];
                result = await handleUploadImage(file.tempFilePath, twittsFolder);
            } else {
                result = null
            }
            const twittData = {
                twitt: req.body.twitt,
                favourites: 0,
                user: userInRequest._id,
                image: result,
                comments: [],
            };
            const newTwitt = await Twitt.create(twittData)
            await User.findByIdAndUpdate(_id,
                {
                    $addToSet: {
                        twitts: newTwitt._id
                    },
                }, {
                new: true
            })
            res.status(200).json(newTwitt);
        } catch (error) {
            res.status(500).json({ msg: `Problema mientras se creaba un twitt` });
            return;
        }
    },
    deleteTwitt: async (req: Request, res: Response): Promise<void> => {
        try {
            const twittIdToDelete = req.params.twittIdToDelete;
            if (!isValidObjectId(twittIdToDelete)) {
                res.status(400).json({ msg: 'Twitt id invalido' });
                return;
            }
            const deletedDocument = await Twitt.findByIdAndRemove(twittIdToDelete);
            if (!deletedDocument) {
                res.status(404).json({ msg: 'Twitt no encontrado' })
            } else {
                const twittImagePublicId = deletedDocument.image.public_id
                if (twittImagePublicId) {
                    await handleDeleteImage(twittImagePublicId);
                }
                await Comment.deleteMany({ twittCommented: twittIdToDelete });
                res.status(200).json(twittIdToDelete);
                return;
            }
        } catch (error) {
            res.status(400).json({ msg: `Problema mientras se borraba un twitt: ${error}` });
            return;
        }

    }
}

export default controller