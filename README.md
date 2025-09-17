# NeuralBot Frontend

A modern React frontend application for NeuralBot, an intelligent car dealership consultant system. Built with cutting-edge technologies to provide a seamless and responsive user experience.

## 🚀 Tech Stack

- **React 19** - Latest React with modern features
- **Vite** - Lightning-fast build tool and dev serverREADME.md
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful & consistent icon library

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** (version 8.0 or higher) or **yarn**

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd neuralbot-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application.

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the development server with hot reload |
| `npm run build` | Creates an optimized production build |
| `npm run preview` | Serves the production build locally for testing |
| `npm run lint` | Runs ESLint to check code quality and style |

## 📁 Project Structure

```
neuralbot-frontend/
├── public/                 # Static assets
│   └── vite.svg           # Vite logo
├── src/
│   ├── components/        # Reusable UI components
│   │   └── ui/           # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── select.tsx
│   ├── lib/              # Utility functions and configurations
│   │   └── utils.ts      # Common utility functions
│   ├── pages/            # Page components
│   ├── assets/           # Images, icons, and other assets
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   ├── index.css         # Global styles and Tailwind imports
│   └── vite-env.d.ts     # Vite environment type definitions
├── components.json       # shadcn/ui configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies and scripts
```

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) components with the following configuration:
- **Style**: New York
- **Base Color**: Zinc
- **CSS Variables**: Enabled
- **Icon Library**: Lucide React

### Adding New Components

To add new shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

Example:
```bash
npx shadcn@latest add dialog
npx shadcn@latest add form
```

## 🔧 Configuration

### Path Aliases

The project is configured with path aliases for cleaner imports:

- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/utils` → `src/lib/utils`
- `@/ui` → `src/components/ui`

### Tailwind CSS

Tailwind is configured with:
- CSS variables for theming
- Custom animations via `tailwindcss-animate`
- PostCSS processing

## 🌟 Features

- ⚡ **Fast Development** - Vite's HMR for instant updates
- 🎨 **Modern UI** - Beautiful components with shadcn/ui
- 📱 **Responsive Design** - Mobile-first approach with Tailwind
- 🔒 **Type Safety** - Full TypeScript support
- ♿ **Accessibility** - Built-in accessibility with Radix UI
- 🎭 **Theming** - CSS variables for easy customization

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates a `dist` folder with optimized assets ready for deployment.

### Preview Production Build

```bash
npm run preview
```

Test your production build locally before deploying.

### Deployment Platforms

This project can be deployed to various platforms:

- **Vercel**: Connect your GitHub repository for automatic deployments
- **Netlify**: Drag and drop the `dist` folder or connect via Git
- **GitHub Pages**: Use GitHub Actions for automated deployment
- **AWS S3 + CloudFront**: Upload the `dist` folder to S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Guidelines

- Follow TypeScript best practices
- Use semantic commit messages
- Ensure components are accessible
- Write clean, readable code
- Test your changes before submitting

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process using port 5173
npx kill-port 5173
# Or use a different port
npm run dev -- --port 3000
```

**Node modules issues:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**
```bash
# Check TypeScript configuration
npx tsc --noEmit
```

## 📄 License

This project is private and proprietary. All rights reserved.

## 📧 Support

For support and questions, please contact the development team.

---

Built with ❤️ for NeuralBot - Revolutionizing car dealership consultations through AI.