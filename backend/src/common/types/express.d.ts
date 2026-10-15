import { JwtPayload } from '../common/decorators/current-user.decorator';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends JwtPayload {}
  }
}

export {};
