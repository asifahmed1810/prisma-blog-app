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

export const commentController={
    createComment
}