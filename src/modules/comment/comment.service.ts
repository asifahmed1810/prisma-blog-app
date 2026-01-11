import { error } from "node:console"
import { prisma } from "../../lib/prisma"
import { CommentStatus } from "../../../generated/prisma/enums"

const createComment=async(payload:{content:string, authorId:string,postId:string,parentId ?:string})=>{

    const postData=await prisma.post.findUniqueOrThrow({
        where:{
            id:payload.postId
        }
    })
    if(payload.parentId){
        const parentData=await prisma.comment.findUniqueOrThrow({
            where:{
                id:payload.parentId
            }
        })
    }
    return await prisma.comment.create({
        data:payload
    })
}

const getCommentById=async(commentId:string)=>{
    return await prisma.comment.findUnique({
        where:{
            id:commentId
        },
        include:{
            post:{
                select:{
                    id:true,
                    title:true
                }
            }
        }
    })
}

const getCommentByAuthor=async(authorId:string)=>{
    return await prisma.comment.findMany({
        where:{
            authorId
        },
        orderBy:{createdAt:"desc"},
        include:{
            post:{
                select:{
                    id:true,
                    title:true
                }
            }
        }
    })
}


const deleteComment=async(commentId:string , authorId:string)=>{
    const commentdata=await prisma.comment.findFirst({
        where:{
            id: commentId,
            authorId
        },
        select:{
            id:true
        }
    })

    if(!commentdata){
        throw new Error("Your provided data is invalid")
    }

    return await prisma.comment.delete({
        where:{
            id:commentdata.id
        }
    })

   
}

const updateComment=async(commentId:string, data:{content ?:string, status?:CommentStatus},authorId:string)=>{
    const commentdata=await prisma.comment.findFirst({
        where:{
            id:commentId,
            authorId
        },
        select:{
            id:true
        }
    })

    if(!commentdata){
        throw new Error("Your provided input is invalid")
    }
    return await prisma.comment.update({
        where:{
            id:commentId,
            authorId
        },
        data,
    })
}

const commentModerate=async(id:string ,data:{status:CommentStatus})=>{
     const commentData = await prisma.comment.findUniqueOrThrow({
        where: {
            id
        },
        select: {
            id: true,
            status: true
        }
    });

    if (commentData.status === data.status) {
        throw new Error(`Your provided status (${data.status}) is already up to date.`)
    }

    return await prisma.comment.update({
        where: {
            id
        },
        data
    })
}


export const commentService={
    createComment,
    getCommentById,
    getCommentByAuthor,
    deleteComment,
    updateComment,
    commentModerate
}