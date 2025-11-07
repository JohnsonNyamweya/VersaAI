import { clerkClient } from "@clerk/express";

export const auth = async (req, res, next) => {
  try {
    const { userId, has } = await req.auth();
    const hasFreePlan = await has({ plan: "Free" });

    const user = await clerkClient.users.getUser(userId);

    req.user = user;
    req.plan = hasFreePlan ? "Free" : "Premium";
    req.free_usage = user.privateMetadata?.free_usage ?? 0;

    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
