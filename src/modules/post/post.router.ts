import { NextFunction, Request, Response, Router } from "express";
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middlewares/auth";


const router = Router();

router.post("/", auth(UserRole.USER ,UserRole.ADMIN), postController.createPost);
router.get("/",postController.getAllPost)
router.get(
    "/stats",
    auth(UserRole.ADMIN),
    postController.getStats)

router.get("/get-mypost", auth(UserRole.USER , UserRole.ADMIN),postController.getMyPost)
router.get("/:postId", postController.getPostById)
router.patch("/:postId",auth(UserRole.USER,UserRole.ADMIN), postController.updatePost)
router.delete("/:postId",auth(UserRole.USER , UserRole.ADMIN), postController.postDelete)


export const postRouter = router;
