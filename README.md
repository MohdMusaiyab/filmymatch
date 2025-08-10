# Snippit

**From Content Chaos to Curated Clarity**

Snippit is a full-stack application designed to help users retain, organize, and share insights from diverse content sources such as articles, podcasts, films, and lectures. It enables the creation of a personalized, searchable knowledge base, ensuring valuable ideas are easily accessible and never lost.

## Features

- **Content Retention:** Capture and store key moments and insights from articles, videos, audio, and more.
- **Smart Organization:** Tag, categorize, and filter snippets using a robust metadata system for efficient retrieval.
- **Advanced Search:** Full-text search and filtering capabilities for quick access to relevant snippets.
- **Cross-Format Support:** Unified interface for managing content from multiple formats.
- **Share & Collaborate:** Share curated snippets with individuals or groups, with granular permission controls.
- **Media Hosting:** Securely upload and manage media files associated with snippets.

## How It Works

1. **Capture:** Use browser extensions or in-app tools to save important moments while reading, listening, or watching.
2. **Organize:** Apply tags, categories, and custom metadata for structured storage.
3. **Search & Retrieve:** Utilize advanced search and filtering to revisit your archive for inspiration or reference.
4. **Share:** Collaborate with others by sharing snippets or collections, with options for public or private access.

## Tech Stack

- **Frontend:** Next.js (React, TypeScript, Tailwind CSS)
- **Backend:** Node.js, Express, Prisma ORM
- **Database:** PostgreSQL (Neon)
- **Authentication:** NextAuth.js with OAuth and JWT support
- **Storage:** AWS S3 for scalable media hosting
- **APIs:** RESTful endpoints for CRUD operations and search
- **Deployment:** Vercel (frontend), AWS (backend and storage)
- **Testing:** Jest, React Testing Library

## Installation & Setup

```bash
git clone https://github.com/yourusername/snippit.git
cd snippit
npm install
# Configure environment variables for database, AWS, and authentication
npm run dev
```


## License

This project is licensed under the MIT License.
