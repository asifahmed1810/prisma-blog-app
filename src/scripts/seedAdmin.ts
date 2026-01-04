import { email } from "better-auth/*";
import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth";

async function seedAdmin() {
    try {

        const adminData={
            name:"Admin",
            email:"admin@gmail.com",
            role:UserRole.ADMIN,
            password:"Admin1234"
        }


        //check user exist on db or not

        const existingUser= await prisma.user.findUnique({
            where:{
                email:adminData.email
            }
        })

        if(existingUser){
            throw new Error("User already exist in DB")
        }

        const signupAdmin=await fetch("http://localhost:3000/api/auth/sign-up/email",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(adminData)
        })


        if(signupAdmin.ok){
            console.log("-----Admin created----");
            console.log(signupAdmin);
            await prisma.user.update({
                where:{
                    email:adminData.email
                },
                data:{
                    emailVerified:true
                }
            })
            console.log("----email verified updated-----");
        }

        console.log("----success-----");

        
    } catch (error) {
        console.error(error);
    }
}

seedAdmin()