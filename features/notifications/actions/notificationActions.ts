"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NotificationService } from "../services/NotificationService";

export interface StandardActionResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Fetch all notifications for the authenticated user session
 */
export async function getNotificationsAction(): Promise<StandardActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to fetch alerts.",
        },
      };
    }

    const data = await NotificationService.getUserNotifications(session.user.id);
    return {
      success: true,
      data,
      message: "Notifications fetched successfully.",
    };
  } catch (err: any) {
    console.error("Action Error (getNotificationsAction):", err);
    return {
      success: false,
      error: {
        code: "UNEXPECTED_ERROR",
        message: err.message || "An unexpected error occurred.",
      },
    };
  }
}

/**
 * Mark a single notification as read
 */
export async function markAsReadAction(id: string): Promise<StandardActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required.",
        },
      };
    }

    const data = await NotificationService.markNotificationAsRead(id, session.user.id);
    return {
      success: true,
      data,
      message: "Notification marked as read.",
    };
  } catch (err: any) {
    console.error("Action Error (markAsReadAction):", err);
    return {
      success: false,
      error: {
        code: "UNEXPECTED_ERROR",
        message: err.message || "Failed to update notification.",
      },
    };
  }
}

/**
 * Dismiss/mark all notifications as read for the current user
 */
export async function markAllAsReadAction(): Promise<StandardActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required.",
        },
      };
    }

    const count = await NotificationService.markAllNotificationsAsRead(session.user.id);
    return {
      success: true,
      data: { count },
      message: `${count} notifications marked as read.`,
    };
  } catch (err: any) {
    console.error("Action Error (markAllAsReadAction):", err);
    return {
      success: false,
      error: {
        code: "UNEXPECTED_ERROR",
        message: err.message || "Failed to update notifications.",
      },
    };
  }
}
