# Карта API — Кабінет користувача

## Існуюче (перед змінами)

| Метод | URL | Auth | Request | Response |
|-------|-----|------|---------|----------|
| POST | /api/Auth/Register | — | FormData: UserName, Email, Password, FullName?, Avatar? | `{ token }` |
| POST | /api/Auth/Login | — | `{ userNameOrEmail, password }` | `{ token }` |
| GET | /api/Auth/Me | Bearer | — | `{ isAuthenticated, name, email, avatarUrl, role }` |
| POST | /api/Auth/ForgotPassword | — | `{ email }` | 200 / 400 |
| POST | /api/Auth/ResetPassword | — | `{ email, token, newPassword }` | 200 |
| GET | /api/orders/my | Bearer | — | `OrderListItemDto[]` |
| GET | /api/orders/{id} | Bearer | — | `OrderDetailsDto` |

## Додано (ЕТАП 2)

| Метод | URL | Auth | Request | Response |
|-------|-----|------|---------|----------|
| GET | /api/account/me | Bearer | — | UserProfileDto |
| PUT | /api/account/profile | Bearer | UpdateProfileRequest | UserProfileDto |
| POST | /api/account/avatar | Bearer | multipart (file) | `{ avatarUrl }` |
| POST | /api/account/change-password | Bearer | `{ currentPassword, newPassword }` | 200 / 400 { errors: string[] } |
| GET | /api/account/confirm-email | — | query: userId, token | 200 / 400 |
| POST | /api/account/resend-confirmation | Bearer | — | 200 / 400 |

## DTO

- **UserProfileDto**: email, userName, fullName, phoneNumber, avatarUrl, isEmailConfirmed, createdAt, role
- **UpdateProfileRequest**: fullName?, phoneNumber? (редаговані поля)
- **ChangePasswordRequest**: currentPassword, newPassword

---

# Список змінених/створених файлів

## Backend

**Створено:**
- `CloneRozetka.Application/Users/DTOs/Account/UserProfileDto.cs`
- `CloneRozetka.Application/Users/DTOs/Account/UpdateProfileRequest.cs`
- `CloneRozetka.Application/Users/DTOs/Account/ChangePasswordRequest.cs`
- `CloneRozetka.Application/Users/Validators/UpdateProfileRequestValidator.cs`
- `CloneRozetka.Application/Users/Validators/ChangePasswordRequestValidator.cs`
- `CloneRozetka.Api/Controllers/AccountController.cs`

**Змінено:**
- `CloneRozetka.Application/Users/Interfaces/IAccountService.cs` — додано GetProfileAsync, UpdateProfileAsync, ChangePasswordAsync (повертає errors), ConfirmEmailAsync, ResendConfirmationEmailAsync
- `CloneRozetka.Infrastructure/Services/Users/AccountService.cs` — реалізація цих методів + ValidateResetToken null check
- `CloneRozetka.Application/Orders/DTOs/OrderListItemDto.cs` — додано ItemsCount
- `CloneRozetka.Infrastructure/Services/Orders/OrderService.cs` — ItemsCount у GetMyOrdersAsync та GetAdminOrdersPagedAsync
- `CloneRozetka.Api/Program.cs` — реєстрація валідаторів Users

## Frontend

**Створено:**
- `src/features/account/accountApi.ts` — getProfile, updateProfile, uploadAvatar, changePassword, resendConfirmation
- `src/pages/AccountPage/index.tsx` — кабінет з табами (Профіль, Мої замовлення, Безпека, Email)
- `src/pages/ForgotPasswordPage.tsx`
- `src/pages/ResetPasswordPage.tsx`
- `src/pages/ConfirmEmailPage.tsx`
- `src/styles/account.css`

**Змінено:**
- `src/features/account/apiAccount.ts` — forgotPassword, resetPassword mutations
- `src/features/orders/api/ordersApi.ts` — OrderListItem.itemsCount
- `src/store/index.ts` — accountApi reducer + middleware
- `src/App.tsx` — маршрути account (AccountPage), forgot-password, reset-password, confirm-email
- `src/components/Navbar.tsx` — посилання профілю веде на /account
- `src/admin/components/auth/SignInForm.tsx` — посилання «Не пам'ятаю пароль» → /forgot-password

---

# Налаштування email

- **Backend:** посилання для reset/confirm формуються з `ClientUrl` з конфігу. Додай у `appsettings.json` або env:
  - `"ClientUrl": "http://localhost:5173"` (фронт для листів).
- **SMTP:** у проєкті використовується `EmailConfiguration` (Application/SMTP/EmailConfiguration.cs). Для production варто винести From, SmtpServer, Port, UserName, Password в appsettings або змінні середовища і читати через IConfiguration.

---

# Чекліст тестування

## Postman (або curl)

1. **Логін:** POST `/api/Auth/Login` body `{ "userNameOrEmail": "user@example.com", "password": "..." }` → зберегти `token`.
2. **Профіль:** GET `/api/account/me` Header `Authorization: Bearer <token>` → UserProfileDto.
3. **Оновити профіль:** PUT `/api/account/profile` body `{ "fullName": "Нове ім'я", "phoneNumber": "+380..." }` → 200, потім знову GET me.
4. **Аватар:** POST `/api/account/avatar` form-data key `file`, файл зображення → 200, `{ "avatarUrl": "..." }`.
5. **Зміна пароля:** POST `/api/account/change-password` body `{ "currentPassword": "старий", "newPassword": "новий6" }` → 200 або 400 з errors.
6. **Forgot password:** POST `/api/Auth/ForgotPassword` body `{ "email": "user@example.com" }` → 200 (лист на пошту).
7. **Reset password:** отримати з листа `token` і `email`, POST `/api/Auth/ResetPassword` body `{ "email", "token", "newPassword" }` → 200.
8. **Confirm email:** у листі перейти по посиланню або GET `/api/account/confirm-email?userId=1&token=...` → 200.
9. **Resend confirmation:** POST `/api/account/resend-confirmation` з Bearer → 200.
10. **Мої замовлення:** GET `/api/orders/my` з Bearer → список; GET `/api/orders/1` → деталі.

## UI flow

1. Реєстрація → логін → перехід на /account.
2. Профіль: переглянути дані → Редагувати → змінити ім'я/телефон → Зберегти; клік по аватару → вибір файлу → оновлення.
3. Мої замовлення: таб «Мої замовлення» → список → клік «Деталі» / посилання на замовлення.
4. Безпека: таб «Безпека» → ввести поточний і новий пароль → Змінити пароль; Вийти.
5. Email: таб «Email» → якщо не підтверджено — «Надіслати лист повторно».
6. Forgot: з сторінки логіну «Не пам'ятаю пароль» → ввести email → лист → перехід по посиланню → reset-password → новий пароль → увійти.
7. Confirm: перехід по посиланню з листа confirm-email → повідомлення «Email підтверджено» → Увійти.
