# Contribution activity

The static homepage loads `/api/contributions`, a native Vercel Node function.
GitHub and GitLab are queried on the server; the browser receives only dates,
counts, source status, and the update time. No repository names, commit messages,
or credentials are returned. The API caches complete results for one hour and
partial results for one minute. An unavailable source is never displayed as zero.

Production environment variables (encrypted in the Vercel project):

- `CONTRIBUTIONS_GITHUB_TOKEN`: authenticated as `suenot`, with **`read:user`**
  (or `user`) scope. GitHub silently omits private/internal contributions without
  it, even if the token has `repo`. The API rejects that incomplete calendar.
  After refreshing the local CLI authorization with
  `gh auth refresh -h github.com -s read:user`, update this encrypted Vercel
  variable and redeploy so the function receives the refreshed credential.
- `CONTRIBUTIONS_GITLAB_TOKEN`: **GitLab.com** personal access token for `suenot`
  with `read_api`. Leave unset until that credential is available.
- `CONTRIBUTIONS_GITLAB_URL`: `https://gitlab.com`.

Load the GitLab.com token from `~/.zshrc` as `GITLAB_COM_READ_API_TOKEN`, following
the owner's credential storage convention. The previously configured `SUENOT_CONTRIBUTIONS_TOKEN`
belongs to the unrelated self-hosted GitLab instance: never send that token to
GitLab.com. Token values must never be committed or prefixed with `PUBLIC_`.

GitHub's authenticated GraphQL contribution calendar includes the private
activity accessible to the token and follows GitHub's contribution rules.
GitLab's authenticated Events API counts activity events, including private
projects: one push event is one event, even when the push contains many commits.
Events are paginated, filtered by UTC date and author, and deduplicated by ID.
The window covers the last twelve months through today. GitLab event retention
and account permissions can limit the history available from its API.

Source totals stay separate. The combined daily grid adds their counts and does
not deduplicate work mirrored between platforms. API figures can differ from a
profile screenshot; no screenshot numbers or estimated private counts are used.

Verification: `node --test tests/contributions.test.mjs` and `bun run build`.
Use Vercel development/preview with credentials to exercise the function;
`astro dev` alone only serves the static site. The primary deployment is Vercel
(push to `master`); GitHub Pages does not run the server function.
