import { prisma } from "../../lib/prisma"

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

export const commentService={
    createComment
}