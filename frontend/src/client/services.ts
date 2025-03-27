import type { CancelablePromise } from "./core/CancelablePromise";
import { OpenAPI } from "./core/OpenAPI";
import { request as __request } from "./core/request";

import type {
  Body_login_login_access_token,
  Message,
  NewPassword,
  Token,
  UserPublic,
  UpdatePassword,
  UserCreate,
  UserRegister,
  UsersPublic,
  UserUpdate,
  UserUpdateMe,
  ItemCreate,
  ItemPublic,
  ItemsPublic,
  ItemUpdate,
} from "./models";

export type TDataLoginAccessToken = {
  formData: Body_login_login_access_token;
};
export type TDataRecoverPassword = {
  email: string;
};
export type TDataResetPassword = {
  requestBody: NewPassword;
};
export type TDataRecoverPasswordHtmlContent = {
  email: string;
};

export class LoginService {
  /**
   * Login Access Token
   * OAuth2 compatible token login, get an access token for future requests
   * @returns Token Successful Response
   * @throws ApiError
   **/
  public static loginAccessToken(
    data: TDataLoginAccessToken
  ): CancelablePromise<Token> {
    const { formData } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/login/access-token",
      formData: formData,
      mediaType: "application/x-www-form-urlencoded",
      errors: {
        422: `Validation Error`,
      },
      useOrg: false,
    });
  }

  /**
   * Test Token
   * Test access token
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static testToken(): CancelablePromise<UserPublic> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/login/test-token",
      useOrg: false,
    });
  }

  /**
   * Recover Password
   * Password Recovery
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static recoverPassword(
    data: TDataRecoverPassword
  ): CancelablePromise<Message> {
    const { email } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/password-recovery/{email}",
      path: {
        email,
      },
      errors: {
        422: `Validation Error`,
      },
      useOrg: false,
    });
  }

  /**
   * Reset Password
   * Reset password
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static resetPassword(
    data: TDataResetPassword
  ): CancelablePromise<Message> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/reset-password/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
      useOrg: false,
    });
  }

  /**
   * Recover Password Html Content
   * HTML Content for Password Recovery
   * @returns string Successful Response
   * @throws ApiError
   */
  public static recoverPasswordHtmlContent(
    data: TDataRecoverPasswordHtmlContent
  ): CancelablePromise<string> {
    const { email } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/password-recovery-html-content/{email}",
      path: {
        email,
      },
      errors: {
        422: `Validation Error`,
      },
      useOrg: false,
    });
  }
}

export type TDataReadUsers = {
  limit?: number;
  skip?: number;
};
export type TDataCreateUser = {
  requestBody: UserCreate;
};
export type TDataUpdateUserMe = {
  requestBody: UserUpdateMe;
};
export type TDataUpdatePasswordMe = {
  requestBody: UpdatePassword;
};
export type TDataRegisterUser = {
  requestBody: UserRegister;
};
export type TDataReadUserById = {
  userId: string;
};
export type TDataUpdateUser = {
  requestBody: UserUpdate;
  userId: string;
};
export type TDataDeleteUser = {
  userId: string;
};

export class UsersService {
  /**
   * Read Users
   * Retrieve users.
   * @returns UsersPublic Successful Response
   * @throws ApiError
   */
  public static readUsers(
    data: TDataReadUsers = {}
  ): CancelablePromise<UsersPublic> {
    const { limit = 100, skip = 0 } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/",
      query: {
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Create User
   * Create new user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static createUser(
    data: TDataCreateUser
  ): CancelablePromise<UserPublic> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Read User Me
   * Get current user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static readUserMe(): CancelablePromise<UserPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/me",
    });
  }

  /**
   * Delete User Me
   * Delete own user.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteUserMe(): CancelablePromise<Message> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/users/me",
    });
  }

  /**
   * Update User Me
   * Update own user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static updateUserMe(
    data: TDataUpdateUserMe
  ): CancelablePromise<UserPublic> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/me",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Update Password Me
   * Update own password.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static updatePasswordMe(
    data: TDataUpdatePasswordMe
  ): CancelablePromise<Message> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/me/password",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Register User
   * Create new user without the need to be logged in.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static registerUser(data): CancelablePromise<UserPublic> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/signup",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Register User
   * Create new user without the need to be logged in.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static signupUser(data): CancelablePromise<UserPublic> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/signup",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Read User By Id
   * Get a specific user by id.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static readUserById(
    data: TDataReadUserById
  ): CancelablePromise<UserPublic> {
    const { userId } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/{user_id}",
      path: {
        user_id: userId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Update User
   * Update a user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static updateUser(
    data: TDataUpdateUser
  ): CancelablePromise<UserPublic> {
    const { requestBody, userId } = data;
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/{user_id}",
      path: {
        user_id: userId,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Delete User
   * Delete a user.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteUser(data: TDataDeleteUser): CancelablePromise<Message> {
    const { userId } = data;
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/users/{user_id}",
      path: {
        user_id: userId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
}

export type TDataTestEmail = {
  emailTo: string;
};

export class UtilsService {
  /**
   * Test Email
   * Test emails.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static testEmail(data: TDataTestEmail): CancelablePromise<Message> {
    const { emailTo } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/utils/test-email/",
      query: {
        email_to: emailTo,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Health Check
   * @returns boolean Successful Response
   * @throws ApiError
   */
  public static healthCheck(): CancelablePromise<boolean> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/utils/health-check/",
    });
  }
}

export type TDataReadItems = {
  limit?: number;
  skip?: number;
};
export type TDataCreateItem = {
  requestBody: ItemCreate;
};
export type TDataReadItem = {
  id: string;
};
export type TDataUpdateItem = {
  id: string;
  requestBody: ItemUpdate;
};
export type TDataDeleteItem = {
  id: string;
};

export class ItemsService {
  /**
   * Read Items
   * Retrieve items.
   * @returns ItemsPublic Successful Response
   * @throws ApiError
   */
  public static readItems(
    data: TDataReadItems = {}
  ): CancelablePromise<ItemsPublic> {
    const { limit = 100, skip = 0 } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/items/",
      query: {
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Create Item
   * Create new item.
   * @returns ItemPublic Successful Response
   * @throws ApiError
   */
  public static createItem(
    data: TDataCreateItem
  ): CancelablePromise<ItemPublic> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/items/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Read Item
   * Get item by ID.
   * @returns ItemPublic Successful Response
   * @throws ApiError
   */
  public static readItem(data: TDataReadItem): CancelablePromise<ItemPublic> {
    const { id } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/items/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Update Item
   * Update an item.
   * @returns ItemPublic Successful Response
   * @throws ApiError
   */
  public static updateItem(
    data: TDataUpdateItem
  ): CancelablePromise<ItemPublic> {
    const { id, requestBody } = data;
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/items/{id}",
      path: {
        id,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Delete Item
   * Delete an item.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteItem(data: TDataDeleteItem): CancelablePromise<Message> {
    const { id } = data;
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/items/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
}

export class ChatService {
  public static getChats(data) {
    const { projectId, limit = 5, skip = 0 } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/processing/chats/?project_id={projectId}",
      path: { projectId },
      errors: {
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static getChat(data) {
    const { chatId, projectId } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: projectId
        ? "/api/v1/processing/chats/{chatId}?project_id={projectId}"
        : "/api/v1/processing/chats/{chatId}",
      path: {
        chatId,
        projectId,
      },
      errors: {
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static createChat(data) {
    const { projectId, name } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: `/api/v1/processing/chats/?project_id={projectId}`,
      path: {
        projectId,
      },
      body: { chat_create: { name: name ? name : "New Chat" } },
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static createMessage(data) {
    const { chatId, projectId, content } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: projectId
        ? `/api/v1/processing/chats/{chatId}/messages?project_id={projectId}`
        : "/api/v1/processing/chats/{chatId}/messages",
      body: { message: { content: content } },
      path: {
        chatId,
        projectId,
      },
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }
}

export class ProjectService {
  public static getProjects(data) {
    const { limit = 5, skip = 0 } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/projects/",
      errors: {
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static getProject(data) {
    const { projectId } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/projects/{projectId}",
      path: {
        projectId,
      },
      errors: {
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static createProjectChat() {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/processing/chats/project_starter",
      errors: {
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }
}

export class TaskService {
  public static getTasks(data) {
    const { limit = 5, skip = 0, projectId } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/tasks/?project_id={projectId}",
      path: {
        projectId,
      },
      errors: {
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static getTask(data) {
    const { taskId } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/tasks/{taskId}",
      path: {
        taskId,
      },
      errors: {
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static createTask() {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/processing/tasks/",
      errors: {
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }
}

export class OrganizationService {
  public static activateOrganization(orgId) {
    return { id: orgId };
  }

  public static getOrganizations(data) {
    const { limit = 5, skip = 0 } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/organizations/",
      errors: {
        422: `Validation Error`,
      },
      useOrg: false,
    });
  }

  public static getOrganization(data) {
    const { organizationId } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/organizations/{organizationId}",
      path: {
        organizationId,
      },
      errors: {
        422: `Validation Error`,
      },
      useOrg: false,
    });
  }
}

export class ClientService {
  // Client Registration
  public static registerClient(data) {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/clients/management/register",
      body: data,
      errors: {
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static registerChildClient(data) {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/clients/management/register/child",
      body: data,
      errors: {
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  // Reservations
  public static createReservation(data) {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/clients/plans/reservations",
      body: data,
      errors: {
        400: `Invalid subscription or time slot already booked`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  // Payments
  public static createPayment(data) {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/clients/plans/payments",
      body: data,
      errors: {
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  // Client Visits
  public static getVisits(data) {
    const { skip = 0, limit = 100 } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/clients/plans/visits",
      query: {
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static getAvailablePlans(data) {
    const { skip = 0, limit = 100, active_only = true, tag = undefined } = data;

    // Don't send 'all' tag to the backend (treat it as no filter)
    const tagParam = tag && tag !== "all" ? tag : undefined;

    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/clients/plans/available-plans",
      query: {
        skip,
        limit,
        active_only,
        ...(tagParam && { tag: tagParam }),
      },
      errors: {
        401: `Unauthorized`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static getPlanById(planId) {
    return __request(OpenAPI, {
      method: "GET",
      url: `/api/v1/clients/plans/available-plans/${planId}`,
      errors: {
        401: `Unauthorized`,
        404: `Not Found`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static getClientGroups(
    data: { skip: number; limit: number } = { skip: 0, limit: 100 }
  ) {

    const { skip = 0, limit = 100 } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/clients/groups/my-groups",
      query: {
        skip,
        limit,
      },
      errors: {
        401: `Unauthorized`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static createPlanInstance(data) {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/clients/plans/plan-instances",
      body: data,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }


  public static getClientPlanInstances(
    data: { skip: number; limit: number; active_only: boolean } = {
      skip: 0,
      limit: 100,
      active_only: false,
    }
  ) {

    const { skip = 0, limit = 100, active_only = false } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/clients/plans/plan-instances",
      query: {
        skip,
        limit,
        active_only,
      },
      errors: {
        401: `Unauthorized`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static getPlanInstance(data) {
    const { instanceId } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: `/api/v1/clients/plans/plan-instances/${instanceId}`,
      errors: {
        401: `Unauthorized`,
        404: `Not Found`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static getPlanInstanceVisits(data) {
    const { instanceId, skip = 0, limit = 100 } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: `/api/v1/clients/plans/plan-instances/${instanceId}/visits`,
      query: {
        skip,
        limit,
      },
      errors: {
        401: `Unauthorized`,
        404: `Not Found`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static getPlanInstancePayments(data) {
    const { instanceId, skip = 0, limit = 100 } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: `/api/v1/clients/plans/plan-instances/${instanceId}/payments`,
      query: {
        skip,
        limit,
      },
      errors: {
        401: `Unauthorized`,
        404: `Not Found`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static makePayment(data) {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/clients/plans/payments",
      body: data,
      errors: {
        401: `Unauthorized`,
        404: `Not Found`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }
}

export class DashboardService {
  // Dashboard metrics with all necessary data for charts
  public static getDashboardMetrics() {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/admin/dashboard/metrics",
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  // Client management
  public static getClients(data) {
    const { skip = 0, limit = 100 } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/admin/clients",
      query: {
        skip,
        limit,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static getClientGroups(data) {
    const { skip = 0, limit = 100 } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/admin/client-groups",
      query: {
        skip,
        limit,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  // Notifications
  public static createNotification(data) {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/admin/notifications",
      body: data,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  // Visit management
  public static checkInClient(data) {
    const { client_id, check_in } = data;

    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/admin/visits/check-in",
      query: {
        client_id,
        check_in,
      },
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static checkOutClient(data) {
    const { visit_id } = data;

    return __request(OpenAPI, {
      method: "PUT",
      url: `/api/v1/admin/visits/${visit_id}/check-out`,
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static checkQrCode(data) {
    const { client_id, qr_code_id } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/admin/check-qr",
      query: {
        client_id,
        qr_code_id,
      },
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static getAllVisits(data) {
    const { skip = 0, limit = 100 } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/admin/all-visits",
      query: {
        skip,
        limit,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static getAllActiveVisits(data) {
    const { skip = 0, limit = 100 } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/admin/all-active-visits",
      query: {
        skip,
        limit,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  // Plan management
  public static getAllPlans(data) {
    const { skip = 0, limit = 100, active_only = false } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/admin/plans",
      query: {
        skip,
        limit,
        active_only,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static createPlan(data) {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/admin/plans",
      body: data,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static getPlan(data) {
    const { id } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: `/api/v1/admin/plans/${id}`,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static updatePlan(data) {
    const { planId, requestBody } = data;

    return __request(OpenAPI, {
      method: "PUT",
      url: `/api/v1/admin/plans/${planId}`,
      body: requestBody,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static deletePlan(data) {
    const { id } = data;

    return __request(OpenAPI, {
      method: "DELETE",
      url: `/api/v1/admin/plans/${id}`,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static getPlanSubscriptions(data) {
    const { plan_id, skip = 0, limit = 100 } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: `/api/v1/admin/plans/${plan_id}/subscriptions`,
      query: {
        skip,
        limit,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  // Reservation management
  public static getAllReservations(data) {
    const { skip = 0, limit = 100, upcoming_only = false } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/admin/all-reservations",
      query: {
        skip,
        limit,
        upcoming_only,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static getAllPayments(data) {
    const { skip = 0, limit = 100, upcoming_only = false } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/admin/all-payments",
      query: {
        skip,
        limit,
        upcoming_only,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static getAllSubscriptions(data) {
    const { skip = 0, limit = 100, upcoming_only = false } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/admin/all-subscriptions",
      query: {
        skip,
        limit,
        upcoming_only,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  // Subscription management
  public static approveSubscription(data) {
    const { subscription_id } = data;

    return __request(OpenAPI, {
      method: "PUT",
      url: `/api/v1/admin/subscriptions/${subscription_id}/approve`,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static forceCreateSubscription(data) {
    const { client_group_id, ...subscriptionData } = data;

    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/admin/subscriptions/force-create",
      query: {
        client_group_id,
      },
      body: subscriptionData,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static createPlanToken(data) {
    const { plan_id, ...rest } = data;

    return __request(OpenAPI, {
      method: "POST",
      url: `/api/v1/admin/plans/${plan_id}/tokens`,
      body: rest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static getPlanTokens(data) {
    const { plan_id } = data;

    return __request(OpenAPI, {
      method: "GET",
      url: `/api/v1/admin/plans/${plan_id}/tokens`,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static validateToken(data) {
    const { token_value } = data;

    return __request(OpenAPI, {
      method: "POST",
      url: `/api/v1/admin/tokens/validate`,
      body: { token_value },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }

  public static useToken(data) {
    return __request(OpenAPI, {
      method: "POST",
      url: `/api/v1/admin/tokens/use`,
      body: data,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
        422: `Validation Error`,
      },
      useOrg: true,
    });
  }
}

// Service to register forms
export class FormsService {

  public static submitForm(data) {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/forms",
      body: data,
      errors: {
        422: `Validation Error`
      },
      useOrg: true
    });
  }
}
