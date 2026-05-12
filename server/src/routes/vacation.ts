import {Router} from "express";
import {VacationController} from "@/controllers/VacationController";
import {VacationRepository} from "@/repositories/VacationRepository";
import {VacationService} from "@/services/VacationService";
import authMiddleware from "@/middleware/authMiddleware";

const vacationRepository = new VacationRepository();
const vacationService = new VacationService(vacationRepository);
const vacationController = new VacationController(vacationService);

const router = Router();

// 보호된 라우트 - 인증 필수
router.get('/summary', authMiddleware, vacationController.getVacationSummary);
router.get('/remaining', authMiddleware, vacationController.getRemainingVacation);
router.post('/init', authMiddleware, vacationController.saveInitVacation);
router.post('/request', authMiddleware, vacationController.requestVacation);
router.get('/requests', authMiddleware, vacationController.getUserRequests);
router.delete('/requests/:id', authMiddleware, vacationController.deleteRequest);

export default router;
