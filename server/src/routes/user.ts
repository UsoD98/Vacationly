import {Router} from "express";
import {UserController} from "@/controllers/UserController";
import {UserRepository} from "@/repositories/UserRepository";
import {UserService} from "@/services/UserService";
import {PasswordService} from "@/services/PasswordService";
import {VacationRepository} from "@/repositories/VacationRepository";
import {VacationService} from "@/services/VacationService";
import {UnitOfWork} from "@/uow/UnifOrWork";

const userRepository = new UserRepository();
const vacationRepository = new VacationRepository();
const unitOfWork = new UnitOfWork();
const passwordService = new PasswordService();
const vacationService = new VacationService(vacationRepository);
const userService = new UserService(userRepository, unitOfWork, passwordService, vacationService);
const userController = new UserController(userService);

const router = Router();

//public
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

//protected

export default router;
