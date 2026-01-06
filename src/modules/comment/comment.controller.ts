import { Request, Response } from "express";
import { commentService } from "./comment.service";
import { error } from "node:console";

const createComment=async(req:Request,res:Response)=>{
    try {
        const user=req.user;
        req.body.authorId=user?.id;
        const result=await commentService.createComment(req.body)

        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({
            error:"Comment Creation failed",
            details:e
        })
    }
}


const getCommentById=async(req:Request , res:Response)=>{
    try {
        
        const {commentId}=req.params;
        const result =await commentService.getCommentById(commentId as string  )

        res.status(201).json(result)

        
    } catch (e) {
        res.status(400).json({
            error: "comment  fetched failed",
            details: e
        })
    }
}


const getCommentByAuthor=async(req:Request , res:Response)=>{
    try {
        
        const {authorId}=req.params;
        const result =await commentService.getCommentByAuthor(authorId as string  )

        res.status(201).json(result)

        
    } catch (e) {
        res.status(400).json({
            error: "comment  fetched failed",
            details: e
        })
    }
}

const deleteComment=async(req:Request , res:Response)=>{
    try {
        const {commentId}=req.params;
        const user=req.user;
        const result=await commentService.deleteComment(commentId as string , user?.id as string)
        res.status(201).json(result)

        
    } catch (e) {
        res.status(400).json({
            error: "comment  delete failed",
            details: e
        })
    }
}


const updateComment=async(req:Request , res:Response)=>{
    try {
        const {commentId}=req.params;
        const user=req.user;
        const result=await commentService.updateComment(commentId as string ,req.body, user?.id as string)
        res.status(201).json(result)

        
    } catch (e) {
        res.status(400).json({
            error: "comment  update failed",
            details: e
        })
    }
}

const commentModerate=async(req:Request , res:Response)=>{
    try {
        const {commentId}=req.params;

        const result=await commentService.commentModerate(commentId as string , req.body)
        res.status(201).json(result)

        
    } catch (e) {
        const errorMessage= (e instanceof Error) ? e.message : "Comment update failed"
        res.status(400).json({
            error: errorMessage,
            details: e
        })
    }
}


export const commentController={
    createComment,
    getCommentById,
    getCommentByAuthor,
    deleteComment,
    updateComment,
    commentModerate
}