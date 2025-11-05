# Cardoon

## Why this app ?

I want to make learning addictive again by making a small card game

## Stack

This is a MERN stack

## Roadmap

1 - Create a single card task
2 - The plan is to use AI to adjust the progress curve

### Board

### 28 01 2025

- I switched to axios
- Created a basic seeding method that can come handy later

> Todo : Display cards on front
> Todo : Start working on basic cards form

### 29 01 2025

- Created very basic card style
- Added basic crud

> TODO : Use Increment to filter the cards

### 30/04/2025

- Created an upgrade page to earn coins while reviewing
- Open BETA
- Card Form is not more user friendly
- Disabled IA generation for new questions for the moment
  > TODO : Adjust card creation option

### 19/10/2025

- Added React front tests

### 20/10/2025

- Added Husky
- Eslint additionnal rules

### 21/10/2025

- Added Express helmet
- Added Zod basic validation

### 22/10/2025

- Added first CI/CD pipelines
- Fixed CI/CD workflow placement (moved to repository root)
- Added comprehensive GitHub Actions workflows:
  - 🔍 ESLint with PR comments
  - 🧪 Tests, TypeScript & Build validation
  - 🎯 Quality Gate for PRs
  - 🚀 Debugging workflow

### 23/10/2025

- 🚀 **Implemented TanStack Query v5** for optimistic card deletion
  - ✨ Instant UI feedback with automatic rollback on errors
  - 📊 Intelligent caching and background synchronization
  - 🔄 Optimistic updates for better user experience
  - 📝 Comprehensive error handling with user-friendly messages
  - 🎯 Centralized query management with standardized keys
  - 📚 Full documentation in `docs/TANSTACK_QUERY_IMPLEMENTATION.md`

### 30/10/2025

- Added a sweet beep after pre-commit and pre-push hooks

### 03/11/2025

- Go back in time...

### 05/11/2025

- Use React Hook Form on EditCardForm

## React Hook Form Integration Status

### ✅ Forms Using React Hook Form

| Component      | Location                                    | Form Type          | Status                                  |
| -------------- | ------------------------------------------- | ------------------ | --------------------------------------- |
| `EditCardForm` | `src/components/molecules/EditCardForm.tsx` | Card editing modal | ✅ **Fully integrated** with validation |

### ❌ Forms Using Manual State Management

#### 📄 Page Components

| Component      | Location                                | Form Type         | Priority  | Notes                        |
| -------------- | --------------------------------------- | ----------------- | --------- | ---------------------------- |
| `LoginPage`    | `src/components/pages/LoginPage.tsx`    | Authentication    | 🔴 High   | User login form              |
| `RegisterPage` | `src/components/pages/RegisterPage.tsx` | User registration | 🔴 High   | User signup form             |
| `CardFormPage` | `src/components/pages/CardFormPage.tsx` | Card creation     | 🟡 Medium | Main card creation interface |
| `UserPage`     | `src/components/pages/UserPage.tsx`     | User settings     | 🟢 Low    | Profile management           |

#### 🎯 Modal Components

| Component            | Location                                          | Form Type          | Priority  | Notes              |
| -------------------- | ------------------------------------------------- | ------------------ | --------- | ------------------ |
| `MultiCardFormModal` | `src/components/molecules/MultiCardFormModal.tsx` | AI card generation | 🟡 Medium | Bulk card creation |

#### 🧩 Form Components

| Component         | Location                                       | Form Type      | Priority | Notes               |
| ----------------- | ---------------------------------------------- | -------------- | -------- | ------------------- |
| `SubQuestionsTab` | `src/components/molecules/SubQuestionsTab.tsx` | Sub-questions  | 🟢 Low   | Question management |
| `DailGoalForm`    | `src/components/pages/UserPage.tsx`            | Daily goals    | 🟢 Low   | Settings form       |
| `AdminPage` forms | `src/components/pages/AdminPage.tsx`           | Admin controls | 🟢 Low   | Item management     |

### 📊 Summary

- **Total Forms**: 9 identified
- **✅ Using React Hook Form**: 1 (11%)
- **❌ Using Manual State**: 8 (89%)

### 🎯 Migration Priority

1. **🔴 High Priority**: Authentication forms (`LoginPage`, `RegisterPage`)
2. **🟡 Medium Priority**: Card creation forms (`CardFormPage`, `MultiCardFormModal`)
3. **🟢 Low Priority**: Settings and admin forms

### 📚 Documentation

- [React Hook Form Integration Guide](docs/REACT_HOOK_FORM_INTEGRATION.md)
- [Tests Update Guide](docs/TESTS_REACT_HOOK_FORM_UPDATE.md)

## TODOS

- Add tests on back
- ✅ ~~Add Tanstack~~ - **DONE** (Optimistic deletion implemented)
- Add profilers
- Add Zustand/Redux
- Yup, React hook forms
- Extend TanStack Query to card creation and editing
- Add storybook
- Add router boundaries for unlogged users
