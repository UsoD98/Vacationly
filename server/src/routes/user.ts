import {Router} from "express";
import {UserController} from "@/controllers/UserController";
import {UserRepository} from "@/repositories/UserRepository";
import {UserService} from "@/services/UserService";
import {PasswordService} from "@/services/PasswordService";
import {UnitOfWork} from "@/uow/UnifOrWork";

const userRepository = new UserRepository();
const unitOfWork = new UnitOfWork();
const passwordService = new PasswordService();
const userService = new UserService(userRepository, unitOfWork, passwordService);
const userController = new UserController(userService);

const router = Router();

router.post('/', userController.createUser);

export default router;
