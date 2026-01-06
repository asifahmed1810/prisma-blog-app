import { Router } from "express";
import { commentController } from "./comment.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router=Router();

router.post("/",auth(UserRole.USER , UserRole.ADMIN),commentController.createComment)
router.get("/:commentId",commentController.getCommentById)
router.get("/author/:authorId", commentController.getCommentByAuthor)
router.delete("/delete/:commentId",auth(UserRole.ADMIN , UserRole.USER), commentController.deleteComment)
router.patch("/update/:commentId",auth(UserRole.ADMIN , UserRole.USER), commentController.updateComment)
router.patch("/update/:commentId/moderate",auth(UserRole.ADMIN ), commentController.commentModerate)





export const commentRouter=router;