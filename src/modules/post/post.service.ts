import { title } from "node:process";
import { CommentStatus, Post, PostStatus } from "../../../generated/prisma/client";
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
    },
    include:{
      _count:{
        select:{comments:true}
      }
    }
  });

  const total=await prisma.post.count({
    where: {
      AND:andConditions
    }
    
  })


  return {
    data:result,
    pagination:{
      total,
      page:payload.page,
      limit:payload.limit,
      total_page:Math.ceil(total/payload.limit)

    }
  };
};


const getPostById = async (postId: string) => {
    return await prisma.$transaction(async (tx) => {
        await tx.post.update({
            where: {
                id: postId
            },
            data: {
                views: {
                    increment: 1
                }
            }
        })
        const postData = await tx.post.findUnique({
            where: {
                id: postId
            },
            include: {
                comments: {
                    where: {
                        parentId: null,
                        status: CommentStatus.APPROVED
                    },
                    orderBy: { createdAt: "desc" },
                    include: {
                        replies: {
                            where: {
                                status: CommentStatus.APPROVED
                            },
                            orderBy: { createdAt: "asc" },
                            include: {
                                replies: {
                                    where: {
                                        status: CommentStatus.APPROVED
                                    },
                                    orderBy: { createdAt: "asc" }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: { comments: true }
                }
            }
        })
        return postData
    })
}



const getMyPost=async(authorId:string)=>{
  const result=await prisma.post.findMany({
    where:{
      authorId
    },
    orderBy:{
      createdAt:"desc"
    }
  })
  console.log(result);

  return result

}


export const postService = {
  createPost,
  getAllPost,
  getPostById,
  getMyPost
};
