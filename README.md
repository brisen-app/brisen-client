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
1. Make your changes in the client and the development environments [Supabase dashboard](https://supabase.com/dashboard/project/tlnldlywflpgvjepxwxz).
    - If you're making changes to the database schema, you'll need to regenerate the Supabase types
        ```bash
        npx supabase gen types typescript --project-id tlnldlywflpgvjepxwxz --schema public > types/supabase.ts
        ```
1. Commit and push changes to the branch
1. Create a pull request with `develop` as the target branch

## Release workflow
When the `develop`-branch is ready for deployment, follow these steps:
1. Run the [Create Relase](https://github.com/brisen-app/brisen-database/actions/workflows/create-release.yaml)-action in the [`brisen-database`](https://github.com/brisen-app/brisen-database)-repo with the correct release version.
    - If necessary, make manual changes to the new release-branch.
    - Update the PR with a list of changes and a summary of the release.
1. Update the version in `app.json` and `package.json` to the new release version.
1. Create a release branch from `develop` with the following naming convention:
    - `release/<release-version>`
1. Create a pull request from the release branch with `main` as the target branch.
    - The PR should include a list of changes and a summary of the release.
1. When a PR is merged into `main`, the app will be automatically built and deployed to the App Store and Google Play Store. (*TODO: Create a GitHub action for this*)

### Upgrade Expo SDK
🔗 [Documentation](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
```bash
npm install expo@latest
npx expo install --fix
```
