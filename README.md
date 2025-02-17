<div align="center">
  <img src="https://media.githubusercontent.com/media/brisen-app/brisen-assets/refs/heads/main/assets/logo/logo-text.png" alt="Brisen" height=100px>
</div>

<p align="center">
  A trivia game for Android and iOS, built with React Native.
</p>

<div align="center">
  <a href="https://expo.dev/accounts/brisen/projects/brisen-client/submissions">
    <img src="https://github.com/brisen-app/brisen-client/actions/workflows/update_prod.yml/badge.svg" alt="Production update status">
  </a>
  <a href="https://sonarqube.kallerud.no/dashboard?id=brisen-app_brisen-client_26c99873-d531-464d-a9a9-0ea569442bdd">
    <img src="https://sonarqube.kallerud.no/api/project_badges/measure?project=brisen-app_brisen-client_26c99873-d531-464d-a9a9-0ea569442bdd&metric=alert_status&token=sqb_fb9cf3e8f814b6cb097b5b0c7290a06d0544dac4" alt="Quality Gate Status">
  </a>
  <a href="https://sonarqube.kallerud.no/dashboard?id=brisen-app_brisen-client_26c99873-d531-464d-a9a9-0ea569442bdd">
    <img src="https://sonarqube.kallerud.no/api/project_badges/measure?project=brisen-app_brisen-client_26c99873-d531-464d-a9a9-0ea569442bdd&metric=ncloc&token=sqb_fb9cf3e8f814b6cb097b5b0c7290a06d0544dac4" alt="Lines of Code">
  </a>
  <a href="https://sonarqube.kallerud.no/dashboard?id=brisen-app_brisen-client_26c99873-d531-464d-a9a9-0ea569442bdd">
    <img src="https://sonarqube.kallerud.no/api/project_badges/measure?project=brisen-app_brisen-client_26c99873-d531-464d-a9a9-0ea569442bdd&metric=coverage&token=sqb_fb9cf3e8f814b6cb097b5b0c7290a06d0544dac4" alt="Coverage">
  </a>
</div>

<div align="center">
  <a href="[https://apps.apple.com/us/app/sql-play/id1546888933?itsct=apps_box&amp;itscg=30200](https://apps.apple.com/us/app/brisen/id6480421611)">
    <img height=50px src="http://sqlplay.net/images/app-store-badge.svg" alt="Download on the App Store">
  </a>
  <a href="https://play.google.com/store/apps/details?id=com.sql_playground&amp;hl=en_US&amp;gl=US&amp;pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1">
    <img height=50px alt="Get it on Google Play" src="https://sqlplay.net/images/google_play_badge.svg">
  </a>
</div>

# Contributing

> If you don't know what to contribute with, check out the [issues](https://github.com/brisen-app/brisen-client/issues).

1. Fork the repo and navigate to the root folder.
1. Install Node LTS
   - Windows: `winget install -e --id OpenJS.NodeJS.LTS`
   - MacOS: `brew install node`
1. Install Expo CLI
   - Run `npm install expo`
1. Install dependecies
   - Run `npm install`
1. Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_ENV=local
   EXPO_PUBLIC_SB_URL_DEV=https://tlnldlywflpgvjepxwxz.supabase.co
   EXPO_PUBLIC_SB_ANON_DEV=<development-enviornment-anon-key>
   EXPO_PUBLIC_RC_KEY_APPLE=<revenue-cat-apple-api-key>
   EXPO_PUBLIC_RC_KEY_GOOGLE=<revenue-cat-google-api-key>
   ```
   If you're making changes to the database schema, you'll need to clone the [`supabase-database`](https://github.com/brisen-app/brisen-database)-repo and follow the instructions in the `README.md`-file.
1. Set up you development environment
   Follow [this](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build&buildEnv=local) guide.
   - Select Development build
   - Disable Build with EAS

## Workflow

1. Create and checkout a new branch from `develop` with the following naming convention:
   - `feature/<feature-name>`
   - `bugfix/<bug-name>`
1. Start the development server

   - Run `npm start`

   If you install a build from the [Expo cloud](https://expo.dev/accounts/brisen/projects/brisen-client/development-builds), you can connect your phone to the development server. If not, start the app on a simulator:

   - Android: `npm run android`
   - iOS: `npm run ios` (MacOS only)

1. Make your changes in the client or the development environment [Supabase dashboard](https://supabase.com/dashboard/project/tlnldlywflpgvjepxwxz).
1. Commit and push changes to the branch
1. Create a pull request with the latest `release`-branch as the target branch

## Guides

### Useful commands

- `npm run build`: Creates a new build for iOS and Android using Expo Cloud. Useful if you have installed a new dependency and want to test the app on a physical device. This takes a while to complete.
- `npm run upgrade`: Updates Expo and all dependencies to the latest version.

### Database schema changes

If you're making changes to the database schema, you'll need to regenerate the Supabase types.

```bash
npx supabase gen types typescript --project-id tlnldlywflpgvjepxwxz --schema public > models/supabase.ts
```

### Unit tests

Make sure to write unit tests for all new features and bug fixes or you will be stopped by the CI/CD pipeline. I recommend installing the [Jest-plugin for VS Code](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest).

# Release workflow

When the `develop`-branch is ready for a new release, follow these steps:

1. Run the [Create Relase](https://github.com/brisen-app/brisen-database/actions/workflows/create-release.yaml)-action in the [`brisen-database`](https://github.com/brisen-app/brisen-database)-repo with the correct release version.
   - If necessary, make manual changes to the new release branch.
   - Update the PR with a list of changes and a summary of the release.
1. Complete the PR and merge the release branch into `main` and wait for the deployment pipeline to complete.
1. Create a release branch from `develop` with the following naming convention:
   - `release/<release-version>`
1. Update the version in `app.config.ts` and `package.json` to the new release version.
1. Create a pull request from the release branch with `main` as the target branch.
   - The PR should include a list of changes and a summary of the release.
   - Make sure to squash and merge the PR.
1. When a PR is merged into `main`, the app will be automatically built and submitted to the App Store and Google Play Store.
1. Log into Google Play Console and App Store Connect to submit the new release for review.

# License

The code in this repository is licensed under a custom license that permits its use only for contributing to the original project. That means no redistribution is allowed, and all contributions must be made available under the same license. For complete details, please refer to the [LICENSE](LICENSE.md) file.

Please ensure that you adhere to these guidelines when using or modifying the code.

# Contributing

We welcome contributions to this project! Please fork the repository and submit a pull request with bug fixes, features, or other improvements. We also encourage you to [create an issue](https://github.com/brisen-app/brisen-client/issues/new/choose) to discuss potential changes or new features.
