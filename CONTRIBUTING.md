# Contributing to RepMotivatedSeller

Thank you for considering contributing to RepMotivatedSeller! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Git Workflow](#git-workflow)
- [Pre-commit Hooks (Windows Users)](#pre-commit-hooks-windows-users)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

---

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```powershell
   git clone https://github.com/YOUR-USERNAME/rep-motivated-seller.git
   cd rep-motivated-seller
   ```
3. **Add upstream remote**:
   ```powershell
   git remote add upstream https://github.com/M051719/rep-motivated-seller.git
   ```

---

## Development Setup

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- PowerShell (Windows) or Bash (macOS/Linux)
- Git 2.x or higher

### Installation

```powershell
# Install dependencies
npm install

# Copy environment template
Copy-Item .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

See `COMPLETE_ENV_TEMPLATE.env` for all required environment variables. Never commit actual API keys or secrets.

---

## Git Workflow

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

**Examples:**
```
feat(youtube): Add YouTube API integration
fix(auth): Resolve login redirect issue
docs(readme): Update installation instructions
chore(deps): Update dependencies
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance tasks

---

## Pre-commit Hooks (Windows Users)

### ⚠️ Known Issue: PowerShell Extension Error

If you encounter this error when committing:

```
Processing -File '.git/hooks/pre-commit' failed because the file does not have a '.ps1' extension.
Specify a valid PowerShell script file name, and then try again.
```

**Root Cause:** PowerShell on Windows requires script files to have a `.ps1` extension, but git hooks traditionally have no extension.

### Solutions

#### Option 1: Bypass Pre-commit Hook (Quick Fix)

Use `--no-verify` flag to skip the pre-commit hook:

```powershell
git commit --no-verify -m "your commit message"
```

**⚠️ Warning:** This skips all pre-commit checks. Only use when the hook is broken.

#### Option 2: Create PowerShell Wrapper (Recommended)

Create a Windows-compatible wrapper script:

1. **Create `.git/hooks/pre-commit.ps1`:**
   ```powershell
   # Pre-commit hook for Windows PowerShell
   # Add your pre-commit checks here
   
   Write-Host "Running pre-commit checks..." -ForegroundColor Cyan
   
   # Example: Run linter
   # npm run lint
   
   # Example: Run type check
   # npm run type-check
   
   # Example: Check for secrets
   # git diff --cached --name-only | ForEach-Object {
   #     if (Select-String -Path $_ -Pattern "SECRET|API_KEY|TOKEN" -Quiet) {
   #         Write-Host "⚠️ Potential secret found in $_" -ForegroundColor Red
   #         exit 1
   #     }
   # }
   
   Write-Host "✓ Pre-commit checks passed" -ForegroundColor Green
   exit 0
   ```

2. **Update `.git/hooks/pre-commit`:**
   ```bash
   #!/bin/sh
   # Git pre-commit hook wrapper
   
   # Detect if running on Windows with PowerShell
   if command -v powershell.exe >/dev/null 2>&1; then
       powershell.exe -ExecutionPolicy Bypass -File ".git/hooks/pre-commit.ps1"
   elif command -v pwsh >/dev/null 2>&1; then
       pwsh -ExecutionPolicy Bypass -File ".git/hooks/pre-commit.ps1"
   else
       # Add your non-Windows pre-commit logic here
       echo "Running pre-commit checks..."
       # npm run lint
       # npm run type-check
       echo "✓ Pre-commit checks passed"
   fi
   ```

3. **Make the hook executable** (macOS/Linux):
   ```bash
   chmod +x .git/hooks/pre-commit
   ```

#### Option 3: Disable Pre-commit Hook

If you don't need pre-commit hooks:

```powershell
# Rename the hook to disable it
Rename-Item .git/hooks/pre-commit .git/hooks/pre-commit.disabled
```

### Creating Custom Pre-commit Checks

Add checks to `.git/hooks/pre-commit.ps1`:

```powershell
# Prevent committing to main directly
$branch = git rev-parse --abbrev-ref HEAD
if ($branch -eq "main") {
    Write-Host "❌ Cannot commit directly to main branch" -ForegroundColor Red
    Write-Host "Please create a feature branch" -ForegroundColor Yellow
    exit 1
}

# Check for debugging statements
$files = git diff --cached --name-only --diff-filter=ACM | Where-Object { $_ -match '\.(js|ts|jsx|tsx)$' }
foreach ($file in $files) {
    if (Select-String -Path $file -Pattern "console\.log|debugger" -Quiet) {
        Write-Host "⚠️ Found debugging statements in $file" -ForegroundColor Yellow
        Write-Host "Consider removing before committing" -ForegroundColor Yellow
        # Uncomment to make this a hard error:
        # exit 1
    }
}

# Run linting
Write-Host "Running linter..." -ForegroundColor Cyan
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Linting failed" -ForegroundColor Red
    exit 1
}

# Run type checking
Write-Host "Running type check..." -ForegroundColor Cyan
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Type checking failed" -ForegroundColor Red
    exit 1
}
```

---

## Code Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode in `tsconfig.json`
- Avoid `any` types - use specific types or `unknown`
- Export interfaces and types for reusability

### React

- Use functional components with hooks
- Prefer named exports over default exports
- Use proper TypeScript types for props
- Follow component structure:
  ```typescript
  // Imports
  import React from 'react';
  
  // Types/Interfaces
  interface Props {
    title: string;
  }
  
  // Component
  export function MyComponent({ title }: Props) {
    return <div>{title}</div>;
  }
  ```

### Formatting

- Use Prettier for code formatting
- Run before committing: `npm run format`
- 2 spaces for indentation
- Single quotes for strings
- Trailing commas in objects/arrays

### File Organization

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API services, integrations
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript types/interfaces
└── lib/           # Third-party library configs
```

---

## Testing

### Running Tests

```powershell
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Place tests next to the file being tested: `MyComponent.test.tsx`
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render title correctly', () => {
    // Arrange
    const title = 'Hello World';
    
    // Act
    render(<MyComponent title={title} />);
    
    // Assert
    expect(screen.getByText(title)).toBeInTheDocument();
  });
});
```

---

## Pull Request Process

### Before Submitting

1. **Sync with upstream:**
   ```powershell
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run checks:**
   ```powershell
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```

3. **Update documentation** if needed

### PR Guidelines

1. **Title:** Use conventional commit format
   ```
   feat(scope): Add new feature
   ```

2. **Description:** Include:
   - What changed and why
   - How to test the changes
   - Screenshots (for UI changes)
   - Related issue numbers

3. **Checklist:**
   ```markdown
   - [ ] Code follows project style guidelines
   - [ ] Tests added/updated and passing
   - [ ] Documentation updated
   - [ ] No console.log or debugging code
   - [ ] Commits follow conventional format
   - [ ] Branch is up to date with main
   ```

### PR Review Process

1. Automated checks must pass (CI/CD)
2. At least one approval required
3. Address review comments
4. Squash commits before merge (if requested)

---

## Getting Help

- **Issues:** https://github.com/M051719/rep-motivated-seller/issues
- **Discussions:** https://github.com/M051719/rep-motivated-seller/discussions
- **Documentation:** See project docs in `/docs` folder

### Common Issues

#### Git Submodule Error

If you see `fatal: No url found for submodule path 'scripts'`:
- See [GIT_CLEANUP_GUIDE.md](./GIT_CLEANUP_GUIDE.md)

#### Environment Variables Not Loading

- Ensure `.env.local` exists
- Restart development server after changes
- Variables must start with `VITE_` for client-side access

#### TypeScript Errors

```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Project README (for significant contributions)
- Release notes

Thank you for contributing! 🎉
