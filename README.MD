### Update 2024
This is a free and open source project, it seems that the scraping isn't working anymore and I don't intent to fix it. Feel free to fork this project and change the code to your needs. Cheers!

# Home Finder

![ScreenShot](https://raw.githubusercontent.com/WeRules/home-finder/main/content/assets/base_site_image.png)

## What is Home Finder?
Home Finder is a free open-source project designed to help people find houses to buy or rent in the Netherlands. The housing market in some Dutch cities is extremely competitive, especially Amsterdam, and being able to apply for a house as soon as they're listed will boost or chances of getting a house.

You can read more about this project on [this blog post](https://pablo.gg/en/blog/coding/creating-a-startup-with-github-actions-and-google-forms/).

## How to use
Go to the [form page in the Home Finder website](https://werules.github.io/home-finder/en/form), and fill the form with your email and all the links from the real estate websites with your search parameters, for example [https://www.funda.nl/en/huur/amsterdam/beschikbaar/0-2000/40+woonopp/2+slaapkamers/1-dag/](https://www.funda.nl/en/huur/amsterdam/beschikbaar/0-2000/40+woonopp/2+slaapkamers/1-dag/), and click submit. After that simply wait for the script to find new houses and send them directly to your email.

The websites supported by this project are: [funda.nl](https://funda.nl), [vbo.nl](https://vbo.nl), [huislijn.nl](https://huislijn.nl), [zah.nl](https://zah.nl), [pararius.nl](https://pararius.nl), [jaap.nl](https://jaap.nl) and [hoekstraenvaneck.nl](https://hoekstraenvaneck.nl), so go ahead to these websites, add your filters and add them to [Home Finder](https://werules.github.io/home-finder/en/).

**Please remember that** this website is only **half of the work**, you will be notified when a new house is listed, but it's up to you to take action fast to be the first one to book a viewing for that house.

## How to Deploy
To deploy your own version you will need to clone 2 GitHub repos, the [Home Finder](https://github.com/WeRules/home-finder) and the [Home Finder Script](https://github.com/WeRules/home-finder-script). If you don't really need the frontend part, you can just clone the script repo.

### The frontend
For the [Home Finder](https://github.com/WeRules/home-finder) project, you will need to do the following steps:

1. Clone the project using the `Use this template` button on GitHub and make sure the project stays public, otherwise you cannot deploy it to GitHub Pages.
2. Change the [siteUrl](https://github.com/WeRules/home-finder/blob/b79635bf04ed9161c425b37df0d95f5f80c9f449/gatsby-config.js#L13) and the [pathPrefix](https://github.com/WeRules/home-finder/blob/b79635bf04ed9161c425b37df0d95f5f80c9f449/gatsby-config.js#L6) properties for Gatsby, so GitHub Actions can deploy the project to `username.github.io/home-finder` properly.
3. Create a [Google Forms like this one](https://docs.google.com/forms/d/e/1FAIpQLSfNXZrkvG-in6kurmGRQt4SOt2xyDOautibKpC4PAeQElzrgQ/viewform) with the exact same field names and field types.
4. Get the Google Forms form ID, for example, `1FAIpQLSfNXZrkvG-in6kurmGRQt4SOt2xyDOautibKpC4PAeQElzrgQ`, and add it to your [repo's secret](https://docs.github.com/en/actions/reference/encrypted-secrets) with the name `GATSBY_GOOGLE_FORM_ID`.
5. Push your changes to the `main` branch and the website will build automatically on push.

### The backend
For the [Home Finder Script](https://github.com/WeRules/home-finder-script) project, you will need to do the following steps:

1. Clone the project using the `Use this template` button on GitHub and make sure to change the project to private, otherwise you may leak user data.
2. Update the `template.html` to use your own website URL
    1. or if you're skipping the frontend, you can simply remove the link in the footer of the email.
3. Get the Google Spreadsheet from the previously created form and make sure to [publish the Google Spreadsheet to the web](https://support.google.com/a/users/answer/9308870) and make it available to anyone with the link too.
    1. or if you're skipping the frontend any Google Spreadsheet will do, but the spreadsheet needs to have the same header fields as the Google Forms.
4. Get the Google Spreadsheet `ID` and `Grid ID`, for example, [for this spreadsheet](https://docs.google.com/spreadsheets/d/1jRMEvfI6OsWUwnaHgH5UwnoikZA0a3s8wPnCortNJ_A/edit#gid=0), the `ID` is `1jRMEvfI6OsWUwnaHgH5UwnoikZA0a3s8wPnCortNJ_A` and the `Grid ID` is `0`.
5. Add 5 new [repo's secret](https://docs.github.com/en/actions/reference/encrypted-secrets):
    1. `EMAIL_USER`: The Gmail email that will be used to send emails.
    2. `EMAIL_PASSWORD`: The password of the Gmail account. It's highly recommended that you [create an App Password](https://support.google.com/mail/answer/185833?hl=en-US) for that.
    3. `GOOGLE_SPREADSHEET_ID`: The Google Spreadsheet `ID`.
    4. `GOOGLE_SPREADSHEET_GID`: The Google Spreadsheet `Grid ID`.
    5. `USER_AGENT`: The user-agent to be used by the scraper script. You can use [your own user-agent](https://www.whatismybrowser.com/detect/what-is-my-user-agent/) if you want.
6. Update [the cron job frequency](https://github.com/WeRules/home-finder-script/blob/main/.github/workflows/run-task.yml#L5) to match your needs.
7. Push your changes to the `main` branch and the script will automatically run accordingly with the cron job settings.

## Supported websites
- [funda.nl](https://funda.nl)
- [vbo.nl](https://vbo.nl)
- [huislijn.nl](https://huislijn.nl)
- [zah.nl](https://zah.nl)
- [pararius.nl](https://pararius.nl)
- [jaap.nl](https://jaap.nl)
- [hoekstraenvaneck.nl](https://hoekstraenvaneck.nl)

## Limitations
Since I don't want to use more than the GitHub Actions free tier, I will be running the script every hour, this should be enough to not pass the monthly limit - well, it depends on the number of users, of course.

I also had to manually write the scraping scripts for [various real estate websites](https://github.com/WeRules/home-finder-script/blob/main/scraper.js#L133), so it's not like you can get notifications from any website anywhere in the Netherlands.

That's why I made this free and open-source and I highly encourage people to deploy their own version and change the frequency of the scraping script to match their needs.

There's also a chance that any of the websites can block the user-agent from scraping them, in this case you need to keep an eye on it and change the user-agent if needed.

## Screenshots
![ScreenShot](https://raw.githubusercontent.com/WeRules/home-finder/main/screenshots/screenshot_1.png)

![ScreenShot](https://raw.githubusercontent.com/WeRules/home-finder/main/screenshots/screenshot_2.png)

## Release Notes
- **v0.3.1:**
    - Fix button color on light theme
- **v0.3.0:**
    - Update website texts and descriptions
    - Add Telegram notification support
    - Add contact page
- **v0.2.0:**
    - Use [react-google-forms-hooks](https://github.com/francisconeves97/react-google-forms-hooks) to parse Google Forms data
    - Remove a bunch of unused code
    - Add bugs to fix later
- **v0.1.0:**
    - First version

## Links
SEO image by https://unsplash.com/photos/rgJ1J8SDEAY

## Donate
Do you like this project? [🥤 Buy me a soda](https://bunq.me/BuyMeASoda)
