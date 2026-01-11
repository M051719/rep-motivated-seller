# Contributing to RepMotivatedSeller

Thank you for your interest in contributing to RepMotivatedSeller! This guide will help you get started.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Git Workflow](#git-workflow)
- [Windows Development Notes](#windows-development-notes)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/rep-motivated-seller.git
   cd rep-motivated-seller
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Git
- Supabase CLI (for local development)
- Docker (for local Supabase)

### Quick Start

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Run type checking
npm run typecheck

# Run linter
npm run lint
```

For detailed setup instructions, see [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md).

## Git Workflow

### Branch Naming

Use descriptive branch names following this pattern:
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

### Commit Messages

Follow conventional commit format:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test updates
- `chore`: Build process or auxiliary tool changes

**Examples:**
```
feat(auth): Add PKCE flow for authentication
fix(forms): Resolve form validation error on submit
docs(readme): Update installation instructions
```

## Windows Development Notes

### PowerShell and Git Hooks

If you're developing on Windows with PowerShell, you may encounter issues with git hooks.

#### Pre-commit Hook Limitations

**Issue:** PowerShell requires script files to have a `.ps1` extension, but git hooks typically have no extension. This can cause the following error:

```
Processing -File '.git/hooks/pre-commit' failed because the file does not have a '.ps1' extension.
Specify a valid PowerShell script file name, and then try again.
```

#### Workarounds

**Option 1: Bypass Pre-commit Hooks When Needed**

When committing changes that trigger this error, use the `--no-verify` flag:

```bash
git commit --no-verify -m "Your commit message"
```

**⚠️ Caution:** This bypasses all pre-commit checks. Use sparingly and ensure you've manually validated your changes.

**Option 2: Convert Hooks to PowerShell (Advanced)**

If you need to use git hooks on Windows:

1. **Create a PowerShell wrapper** for the hook:
   ```powershell
   # Create .git/hooks/pre-commit.ps1
   # Add your pre-commit logic here
   # Example:
   npm run lint
   npm run typecheck
   ```

2. **Create a batch file wrapper** at `.git/hooks/pre-commit`:
   ```batch
   @echo off
   powershell -ExecutionPolicy Bypass -File "%~dp0pre-commit.ps1"
   ```

3. **Set execution policy** (if needed):
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

**Option 3: Use WSL (Windows Subsystem for Linux)**

For the best cross-platform git hook experience on Windows:

1. Install [WSL](https://docs.microsoft.com/en-us/windows/wsl/install)
2. Clone the repository in your WSL environment
3. Git hooks will work natively in WSL

### Windows-Specific Scripts

This repository includes many `.bat` scripts for Windows development:

- `MASTER-PRODUCTION-DEPLOY.bat` - Production deployment
- `test-connection.bat` - Test Supabase connection
- `test-form-submission.bat` - Test form functionality
- Various Twilio and admin testing scripts

When using these scripts:
- Run them from Command Prompt or PowerShell
- Ensure environment variables are set in your shell session
- Some scripts may require administrator privileges

### Line Endings

The repository uses `.gitattributes` to manage line endings:
- **Source code files (`.js`, `.ts`, `.jsx`, `.tsx`, etc.)**: LF (Unix-style)
- **Windows scripts (`.bat`, `.ps1`, `.cmd`)**: CRLF (Windows-style)
- **Shell scripts (`.sh`, `.bash`)**: LF (Unix-style)

Git will automatically convert line endings based on these settings. If you encounter line ending issues:

```bash
# Refresh all files with proper line endings
git rm --cached -r .
git reset --hard
```

## Code Style Guidelines

### JavaScript/TypeScript

- Use TypeScript for all new code
- Follow the existing code style
- Use ESLint rules defined in the project
- Prefer functional components and hooks in React
- Use meaningful variable and function names

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript interfaces for props

Example:
```typescript
interface MyComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onSubmit }) => {
  // Component implementation
};
```

### Edge Functions (Deno)

- Use Deno-compatible imports
- Handle errors gracefully
- Validate input data
- Return consistent response formats
- Use environment variables for configuration

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Test Supabase connection
npm run test:connection

# Run health check
npm run health-check
```

### Writing Tests

- Write tests for new features
- Ensure tests are isolated and repeatable
- Use descriptive test names
- Follow the existing test structure

Example:
```typescript
describe('ForeclosureForm', () => {
  it('should validate required fields', () => {
    // Test implementation
  });

  it('should submit form data correctly', () => {
    // Test implementation
  });
});
```

## Submitting Changes

### Before Submitting a Pull Request

1. **Ensure all tests pass**:
   ```bash
   npm run test
   ```

2. **Run type checking**:
   ```bash
   npm run typecheck
   ```

3. **Run linting**:
   ```bash
   npm run lint
   ```

4. **Update documentation** if you've changed APIs or added features

5. **Test your changes** thoroughly in your local environment

### Pull Request Process

1. **Create a Pull Request** on GitHub from your fork
2. **Fill out the PR template** with:
   - Description of changes
   - Related issues
   - Testing performed
   - Screenshots (for UI changes)
3. **Wait for review** from maintainers
4. **Address feedback** by pushing additional commits
5. **Squash commits** if requested
6. **Celebrate** when your PR is merged! 🎉

### Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Include tests for new functionality
- Update documentation as needed
- Ensure CI/CD checks pass
- Respond to review comments promptly
- Be open to feedback and suggestions

## Database Changes

When making database schema changes:

1. **Create a migration**:
   ```bash
   supabase migration new your_change_description
   ```

2. **Write the migration SQL** in the generated file

3. **Test locally**:
   ```bash
   npm run supabase:reset
   ```

4. **Document the change** in the migration file with comments

5. **Include RLS policies** for new tables

See [DATABASE_SYNC_GUIDE.md](./DATABASE_SYNC_GUIDE.md) for more details.

## Edge Functions

When adding or modifying Edge Functions:

1. **Create the function directory**:
   ```bash
   mkdir -p supabase/functions/my-function
   ```

2. **Create `index.ts`** with Deno imports

3. **Test locally**:
   ```bash
   supabase functions serve my-function
   ```

4. **Set environment variables** in Supabase dashboard or `config.toml`

5. **Document the function** in code comments and relevant guides

See [SUPABASE_EDGE_FUNCTIONS_GUIDE.md](./SUPABASE_EDGE_FUNCTIONS_GUIDE.md) for more details.

## Security

### Reporting Security Issues

**DO NOT** create public GitHub issues for security vulnerabilities.

Instead, please email security concerns to the repository maintainer or use GitHub's private security vulnerability reporting feature.

### Security Best Practices

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Follow RLS (Row Level Security) policies
- Validate all user input
- Use prepared statements for database queries
- Keep dependencies updated

## Getting Help

- **Documentation**: Check the various `.md` guides in the repository
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the maintainer for sensitive topics

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discriminatory language
- Personal attacks or trolling
- Publishing others' private information
- Other conduct inappropriate in a professional setting

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to RepMotivatedSeller!** Your efforts help make foreclosure assistance more accessible to those in need.

For more detailed information, see:
- [PROJECT_HISTORY_AND_WALKTHROUGH.md](./PROJECT_HISTORY_AND_WALKTHROUGH.md)
- [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)
- [TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)
