import { title } from "node:process";
import { Post, PostStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { PostWhereInput } from "../../../generated/prisma/models";
import { boolean } from "better-auth/*";
import { SortOrder } from "../../../generated/prisma/internal/prismaNamespace";

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">,
  userId: string
) => {
  const result = await prisma.post.create({
    data: {
      ...data,
      authorId: userId,
    },
  });
  return result;
};

const getAllPost = async (payload: { search: string | undefined  , tags:string[]|[] ,isFeatured:boolean | undefined ,status:PostStatus|undefined , authorId:string|undefined,page:number , limit:number,skip:number,sortBy:string , sortOrder:string}) => {



  const andConditions:PostWhereInput[]=[]

  if(payload.search){
    andConditions.push({
      OR: [
        {
          title: {
            contains: payload.search as string,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: payload.search as string,
            mode: "insensitive",
          },
        },
        {
            tags:{
                has:payload.search as string
            }
        }
      ]
    })
  }

  if(payload.tags.length>0){
    andConditions.push({tags:{
        hasEvery:payload.tags as string[]
      }})
  }

  if(typeof payload.isFeatured==='boolean'){
    andConditions.push({isFeatured:payload.isFeatured})
  }

   if (payload.status) {
        andConditions.push({
            status:payload.status
        })
    }

    if (payload.authorId) {
        andConditions.push({
            authorId:payload.authorId
        })
    }


  const result = await prisma.post.findMany({
    take:payload.limit,
    skip:payload.skip,
    where: {
      AND:andConditions
    },
    orderBy:{
      [payload.sortBy]:payload.sortOrder
    }
  });
  return result;
};

export const postService = {
  createPost,
  getAllPost,
};
