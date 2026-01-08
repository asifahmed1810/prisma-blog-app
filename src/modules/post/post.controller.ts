import { Request, Response } from "express";
import { postService } from "./post.service";
import { PostStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelpers";
import { error } from "node:console";
import { string } from "better-auth/*";
import { UserRole } from "../../middlewares/auth";

const createPost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        error: "Unauthorized!",
      });
    }
    const result = await postService.createPost(req.body, user.id as string);
    res.status(201).json(result);
  } catch (e) {
    res.status(400).json({
      error: "Post creation failed",
      details: e,
    });
  }
};

const getAllPost = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const tags = req.query.tags ? (req.query.tags as string).split(",") : [];
    const searhString = typeof search === "string" ? search : undefined;
    const isFeatured = req.query.isFeatured
      ? req.query.isFeatured === "true"
      : undefined;
    const status = req.query.status as PostStatus | undefined;
    const authorId = req.query.authorId as string | undefined;

    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(
      req.query
    );

    const result = await postService.getAllPost({
      search: searhString,
      tags,
      isFeatured,
      status,
      authorId,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    });
    res.status(201).json(result);
  } catch (e: any) {
    res.status(404).json({
      error: "Post fetch failed",
      message: e.message,
    });
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      throw new Error("Post Id is required!");
    }
    const result = await postService.getPostById(postId);
    res.status(200).json(result);
  } catch (e: any) {
    res.status(404).json({
      error: "Post fetch failed",
      message: e.message,
    });
  }
};

const getMyPost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("you are unauthorized");
    }
    const result = await postService.getMyPost(user.id);
    console.log(user);

    res.status(201).json(result);
  } catch (e: any) {
    res.status(404).json({
      error: "Post fetch failed",
      message: e.message,
    });
  }
};

const updatePost=async(req:Request ,res:Response)=>{
  try {
    const user=req.user;
    if(!user){
      throw new Error("You are Unauthorized")
    }
    const {postId}=req.params;
    const isAdmin= user.role===UserRole.ADMIN;
    const result=await postService.updatePost(postId as string ,req.body , user.id , isAdmin)
    res.status(201).json(result);
  } catch (e:any) {
    res.status(404).json({
      error:"Post update failed",
      message:e.message
    })
  }
}

const postDelete=async(req:Request ,res:Response)=>{
  try {
    const user=req.user;
    if(!user){
       throw new Error("You are Unauthorized")
    }
    const {postId}=req.params;
    const isAdmin=user.role===UserRole.ADMIN;
    const result=await postService.postDelete(postId as string , user.id , isAdmin)

    res.status(201).json(result)
    
  } catch (e:any) {
    res.status(404).json({
      error:"Post delete failed",
      message:e.message
    })
  }
}

const getStats = async (req: Request, res: Response) => {
    try {
        const result = await postService.getStats();
        res.status(200).json(result)
    } catch (e:any) {
    res.status(404).json({
      error:"Stats fetched failed",
      message:e.message
    })
  }
}


export const postController = {
  createPost,
  getAllPost,
  getPostById,
  getMyPost,
  updatePost,
  postDelete,
  getStats
  
};
