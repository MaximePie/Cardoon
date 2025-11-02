import { NotFoundError } from "../errors";
import User from "../models/User";

export class UserService {
  static async getUserProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    await user.createDailyGoal(user.dailyGoal, new Date());
    await user.populate(["items.base", "currentDailyGoal"]);

    return user;
  }
}
