# Brisen Client

## Setup
1. Install Node LTS
    - Windows: `winget install -e --id OpenJS.NodeJS.LTS`
    - MacOS: `brew install node`
1. Install Expo CLI
    - Run `npm install expo`
1. Install dependecies
    - Run `npm install`
1. Create a `.env` file in the root directory:
    ```env
    EXPO_PUBLIC_SB_URL=https://tlnldlywflpgvjepxwxz.supabase.co
    EXPO_PUBLIC_SB_ANON=<development-enviornment-anon-key>
    ```
    If you're making changes to the database schema, you'll need to clone the [`supabase-database`](https://github.com/brisen-app/brisen-database)-repo and follow the instructions in the `README.md`-file.

## Development workflow
1. Create and checkout a new branch from `develop` with the following naming convention:
    - `feature/<feature-name>`
    - `bugfix/<bug-name>`
1. Start the development server
    - Run `npm start`
    - If you're making changes to the database schema, you'll also need to run the local Supabase instance. **Do not** make changes directly to the development or production databases.
1. Make your changes
    - If you're making changes to the database schema, you'll need to regenerate the Supabase types
        ```bash
        npx supabase gen types typescript --db-url postgresql://postgres:postgres@127.0.0.1:54322/postgres --schema public > types/supabase.ts
        ```
1. Commit and push changes to the branch
1. Create a pull request with `develop` as the target branch

### Upgrade Expo SDK
🔗 [Documentation](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
```bash
npm install expo
npx expo install --fix
```
