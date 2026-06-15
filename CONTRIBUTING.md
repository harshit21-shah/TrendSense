# Contributing to TrendSense

Thank you for your interest in contributing to TrendSense! This document provides guidelines and instructions for contributing.

## 🎯 Ways to Contribute

- 🐛 Report bugs and issues
- 💡 Suggest new features or enhancements
- 📝 Improve documentation
- 🔧 Submit bug fixes
- ✨ Add new features
- 🎨 Improve UI/UX
- 🧪 Write tests

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/trendsense.git
cd trendsense

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/trendsense.git
```

### 2. Set Up Development Environment

Follow the [Quick Start guide](README.md#-quick-start) in the README to set up your local environment.

### 3. Create a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

## 📋 Development Guidelines

### Code Style

**Python (Backend):**
- Follow PEP 8
- Use Black for formatting: `black .`
- Use type hints
- Maximum line length: 100 characters

**TypeScript (Frontend):**
- Follow ESLint configuration
- Use Prettier for formatting: `npm run format`
- Use functional components with hooks
- Prefer named exports

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add timeline filtering by domain
fix: resolve TVS calculation bug
docs: update API documentation
style: format code with Black
refactor: simplify RAG agent logic
test: add tests for sentiment analysis
chore: update dependencies
```

### Testing

**Backend:**
```bash
cd backend
pytest
pytest --cov=app tests/  # with coverage
```

**Frontend:**
```bash
cd frontend
npm test
npm run test:coverage
```

### Documentation

- Update README.md if adding new features
- Add JSDoc/docstrings for new functions
- Update API documentation for new endpoints
- Include screenshots for UI changes

## 🔄 Pull Request Process

### 1. Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Commits are atomic and well-described

### 2. Submit PR

```bash
# Push your branch
git push origin feature/your-feature-name

# Create PR on GitHub
# Fill out the PR template
```

### 3. PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
```

### 4. Review Process

- Maintainers will review your PR
- Address feedback and requested changes
- Once approved, your PR will be merged

## 🐛 Reporting Bugs

### Before Reporting

1. Check existing issues
2. Try the latest version
3. Reproduce the bug consistently

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Mockups, examples, etc.
```

## 🏗️ Architecture Guidelines

### Backend

- Keep agents focused and single-purpose
- Use dependency injection
- Handle errors gracefully
- Log important events
- Use async/await for I/O operations

### Frontend

- Keep components small and reusable
- Use custom hooks for shared logic
- Optimize re-renders with React.memo
- Use React Query for server state
- Use Zustand for client state

### Database

- Write migrations for schema changes
- Index frequently queried columns
- Use transactions for multi-step operations
- Validate data at the application layer

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## 🤝 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable behavior:**
- Trolling, insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated promptly and fairly.

## 📧 Questions?

- Open a [GitHub Discussion](https://github.com/yourusername/trendsense/discussions)
- Join our [Discord server](https://discord.gg/trendsense)
- Email: contribute@trendsense.dev

---

Thank you for contributing to TrendSense! 🚀
