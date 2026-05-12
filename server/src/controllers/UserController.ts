import {Request, Response} from 'express';
import {UserService} from "@/services/UserService";
import {GetUserByIdResponse, GetUsersResponse, UserResponse} from '@/types/user';
import {AppError} from "@/errors/AppError";

export class UserController {
  constructor(private readonly service: UserService) {
  }

  getUsers = async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.service.getUsers();
      const response: GetUsersResponse = {
        success: true,
        message: '사용자 목록 조회에 성공했습니다',
        data: users,
      };
      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, '사용자 목록 조회 중 오류가 발생했습니다');
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = this.parseId(req.params.id);
      const user = await this.service.getUserById(id);
      const response: GetUserByIdResponse = {
        success: true,
        message: '사용자 조회에 성공했습니다',
        data: user,
      };
      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res, '사용자 조회 중 오류가 발생했습니다');
    }
  };

  /**
   * 사용자 생성
   * @param req
   * @param res
   */
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {

      const rst: boolean = await this.service.createUser(req.body);
      if (rst) {
        const response: UserResponse = {
          success: true,
          message: '회원가입에 성공했습니다',
        };
        res.status(201).json(response);
      } else {
        throw AppError.badRequest('사용자 저장에 실패했습니다.', 'USER_SAVE_FAILED');
      }
    } catch (error) {
      // AppError 처리
      if (error instanceof AppError) {
        const response: UserResponse = {
          success: false,
          message: error.message,
          code: error.code,
        };
        res.status(error.statusCode).json(response);
        return;
      }

      // 예상치 못한 에러 처리
      const message = (error as Error).message || '회원가입 중 오류가 발생했습니다';
      const response: UserResponse = {success: false, message, code: 'INTERNAL_SERVER_ERROR'};
      res.status(500).json(response);
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = this.parseId(req.params.id);
      const rst: boolean = await this.service.updateUser(id, req.body);
      if (rst) {
        const response: UserResponse = {
          success: true,
          message: '사용자 수정에 성공했습니다',
        };
        res.status(200).json(response);
      } else {
        throw AppError.badRequest('사용자 수정에 실패했습니다.', 'USER_UPDATE_FAILED');
      }
    } catch (error) {
      this.handleError(error, res, '사용자 수정 중 오류가 발생했습니다');
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = this.parseId(req.params.id);
      const rst: boolean = await this.service.deleteUser(id);
      if (rst) {
        const response: UserResponse = {
          success: true,
          message: '사용자 삭제에 성공했습니다',
        };
        res.status(200).json(response);
      } else {
        throw AppError.badRequest('사용자 삭제에 실패했습니다.', 'USER_DELETE_FAILED');
      }
    } catch (error) {
      this.handleError(error, res, '사용자 삭제 중 오류가 발생했습니다');
    }
  };

  private parseId(idValue: string): number {
    const id = Number.parseInt(idValue, 10);
    if (!Number.isInteger(id) || id <= 0) {
      throw AppError.badRequest('유효한 사용자 ID가 아닙니다.', 'INVALID_USER_ID');
    }
    return id;
  }

  private handleError(error: unknown, res: Response, fallbackMessage: string): void {
    if (error instanceof AppError) {
      const response: UserResponse = {
        success: false,
        message: error.message,
        code: error.code,
      };
      res.status(error.statusCode).json(response);
      return;
    }

    const message = error instanceof Error && error.message ? error.message : fallbackMessage;
    const response: UserResponse = {
      success: false,
      message,
      code: 'INTERNAL_SERVER_ERROR',
    };
    res.status(500).json(response);
  }


}