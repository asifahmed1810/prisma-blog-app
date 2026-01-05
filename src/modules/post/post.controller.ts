import { Request, Response } from "express";
import { postService } from "./post.service";
import { PostStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelpers";
const createPost = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                error: "Unauthorized!",
            })
        }
        const result = await postService.createPost(req.body, user.id as string)
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({
            error: "Post creation failed",
            details: e
        })
    }
}

const getAllPost=async(req:Request, res:Response)=>{
    try {
        const {search}=req.query;
        const tags=req.query.tags? (req.query.tags as string).split(","):[];
        const searhString= typeof search ==='string' ? search :undefined;
        const isFeatured=req.query.isFeatured? req.query.isFeatured==='true':undefined;
        const status=req.query.status as PostStatus | undefined;
        const authorId=req.query.authorId as string | undefined;
        
        const {page,limit,skip,sortBy,sortOrder}=paginationSortingHelper(req.query)



        const result =await postService.getAllPost({search:searhString , tags,isFeatured ,status,authorId,page,limit,skip,sortBy,sortOrder})
         res.status(201).json(result)
        
        
    } catch (e) {
         res.status(400).json({
            error: "Post creation failed",
            details: e
        })
    }
}


const getSingleId=async(req:Request , res:Response)=>{
    try {
        const {id}=req.params;
        if(!id){
            throw new Error("Post id is required")
        }
        const result =await postService.getSingleId(id )

        res.status(201).json(result)

        
    } catch (e) {
        res.status(400).json({
            error: "Post creation failed",
            details: e
        })
    }
}


export const postController={
    createPost,
    getAllPost,
    getSingleId
}