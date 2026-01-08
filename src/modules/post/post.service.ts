import { title } from "node:process";
import { CommentStatus, Post, PostStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { PostWhereInput } from "../../../generated/prisma/models";
import { boolean, promise } from "better-auth/*";
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
    },
    include:{
       _count:{
        select:{
          comments:true
        }
       }
    }
  })
  
  const total=await prisma.post.count({
    where:{
      authorId
    }
  })

  return {
    data:result,
    total
  }

}

const updatePost=async(postId:string , data:Partial<Post> , authorId:string,isAdmin:boolean)=>{
  const postData=await prisma.post.findUniqueOrThrow({
    where:{
      id:postId
    },
    select:{
      id:true,
      authorId:true
    }
  })

  if(!isAdmin && (postData.authorId !== authorId)){
    throw new Error("You are not author in this post")
  }

  if(!isAdmin){
    delete data.isFeatured;
  }

  const result= await prisma.post.update({
    where:{
      id:postData.id
    },
    data
  })

  return result


}

const postDelete=async(postId:string , authorId:string ,isAdmin:boolean)=>{
  const postData=await prisma.post.findUniqueOrThrow({
    where:{
      id:postId
    },
    select:{
      id:true,
      authorId:true
    }
  })

  if(!isAdmin && (postData.authorId !==authorId)){
    throw new Error("You are not author in this post")
  }

  return await prisma.post.delete({
    where:{
      id:postId
    }
  })

}


const getStats=async()=>{
  return await prisma.$transaction(async(tx)=>{
     const [totalPosts, publishedPosts, draftPosts, archivedPosts, totalComments, approvedComment, totalUsers, adminCount, userCount, totalViews] =
            await Promise.all([
                await tx.post.count(),
                await tx.post.count({ where: { status: PostStatus.PUBLISHED } }),
                await tx.post.count({ where: { status: PostStatus.DRAFT } }),
                await tx.post.count({ where: { status: PostStatus.ARCHIVED } }),
                await tx.comment.count(),
                await tx.comment.count({ where: { status: CommentStatus.APPROVED } }),
                await tx.user.count(),
                await tx.user.count({ where: { role: "ADMIN" } }),
                await tx.user.count({ where: { role: "USER" } }),
                await tx.post.aggregate({
                    _sum: { views: true }
                })
            ])

        return {
            totalPosts,
            publishedPosts,
            draftPosts,
            archivedPosts,
            totalComments,
            approvedComment,
            totalUsers,
            adminCount,
            userCount,
            totalViews: totalViews._sum.views
        }
    })
}


export const postService = {
  createPost,
  getAllPost,
  getPostById,
  getMyPost,
  updatePost,
  postDelete,
  getStats
};
