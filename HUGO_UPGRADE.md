# Hugo Upgrade Guide

This document describes the Hugo upgrade process for benpm.github.io from an older version to Hugo v0.152.2 (latest as of December 2025).

## Current Status

- **Theme**: hugo-theme-codex (requires minimum Hugo v0.82.0)
- **Target Version**: Hugo v0.152.2
- **Configuration**: config.toml (compatible with modern Hugo)

## Installation Instructions

### Option 1: Install from apt (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install hugo
```

This will install Hugo v0.123.7, which is compatible with the site but not the absolute latest.

### Option 2: Install Latest Version Using Go

If you have Go installed (1.22 or later):

```bash
CGO_ENABLED=1 go install -tags extended github.com/gohugoio/hugo@latest
```

This will install Hugo v0.152.2 (the latest version).

### Option 3: Download Pre-built Binary

Download the extended version from the official releases:

```bash
wget https://github.com/gohugoio/hugo/releases/download/v0.152.2/hugo_extended_0.152.2_linux-amd64.tar.gz
tar -xzf hugo_extended_0.152.2_linux-amd64.tar.gz
sudo mv hugo /usr/local/bin/
```

Adjust the URL for your platform (macOS, Windows, etc.).

## Key Changes in Recent Hugo Versions

### v0.152.0 - YAML Library Upgrade (Breaking Change)

The most significant change is the upgrade to a modern YAML library. This affects how YAML front matter is parsed:

- **Unquoted boolean-like strings**: Strings like "yes", "no", "on", "off" are now treated as strings, not booleans
- **Impact**: This site uses `true` and `false` for booleans in YAML front matter, so **no changes are needed**
- **YAML anchors and aliases**: Now supported

### v0.152.2 - File Mounting Improvements

- Improved handling of `node_modules` references relative to project root
- Better source validation for file mounts

### v0.151.0 - New Features

- Added `transform.HTMLToMarkdown` template function
- OSC 9;4 terminal progress reporting during builds

### v0.149.0

- Upgraded to Go 1.25
- Added `collections.D` function for random integer sequences

## Configuration Compatibility

The current `config.toml` is fully compatible with modern Hugo versions. No configuration changes are required.

Key configuration elements that are up to date:

- ✅ `[markup.goldmark.renderer]` - modern Goldmark configuration
- ✅ `[markup.highlight]` - syntax highlighting configuration
- ✅ `[[menu.main]]` - menu configuration
- ✅ `[params]` - custom parameters

## GitHub Actions Workflow Updates

The `.github/workflows/gh-pages.yml` file has been updated with:

- **Hugo version**: Updated from v0.92.2 to 'latest' (currently v0.152.2)
- **Extended version**: Now enabled (required for Sass/SCSS support)
- **Runner**: Updated from ubuntu-20.04 to ubuntu-latest
- **Actions versions**: Updated to latest versions
  - `actions/checkout@v4` (was v2)
  - `peaceiris/actions-hugo@v3` (was v2)
  - `peaceiris/actions-gh-pages@v4` (was v3)

These updates ensure the CI/CD pipeline uses the latest Hugo version and benefits from improved GitHub Actions features.

## Theme Compatibility

The hugo-theme-codex theme requires Hugo v0.82.0 or later. All modern versions are compatible.

## Testing the Upgrade

After installing Hugo, test the site locally:

```bash
# Initialize submodules (if not already done)
git submodule update --init --recursive

# Start the development server
hugo server -D

# Build the site
hugo
```

The site should build without errors. Check:

1. All pages render correctly
2. Syntax highlighting works
3. Menu navigation functions
4. Static assets load properly
5. Custom shortcodes work (e.g., `{{< youtube >}}`)

## Troubleshooting

### Issue: Theme not found

**Solution**: Initialize git submodules:
```bash
git submodule update --init --recursive
```

### Issue: Build errors related to YAML

**Check**: Ensure all YAML front matter uses proper syntax
- Use `true`/`false` for booleans (not "yes"/"no")
- Quote strings that might be interpreted as other types

### Issue: Deprecated configuration warnings

Hugo will show warnings for deprecated configurations. Update config.toml based on the warnings shown.

## Migration Sources

- [Hugo Releases](https://github.com/gohugoio/hugo/releases)
- [Hugo News](https://gohugo.io/news/)
- [Upgrading Hugo Guide](https://altitudecode.com.au/posts/2025-03-25-upgrading-hugo/)
- [Hugo Discourse Community](https://discourse.gohugo.io/)

## Verification

After upgrade, verify:

- [ ] Hugo version is v0.123.7 or later
- [ ] Site builds without errors: `hugo`
- [ ] Development server works: `hugo server -D`
- [ ] All content pages are accessible
- [ ] Theme renders correctly
- [ ] No deprecation warnings in build output

## Next Steps

1. Install Hugo using one of the methods above
2. Run `hugo version` to verify installation
3. Test the site with `hugo server -D`
4. Build the site with `hugo`
5. Deploy if all tests pass

## Additional Resources

- [Hugo Documentation](https://gohugo.io/documentation/)
- [Hugo Theme Codex](https://github.com/jakewies/hugo-theme-codex)
- [Hugo Configuration Documentation](https://gohugo.io/getting-started/configuration/)
